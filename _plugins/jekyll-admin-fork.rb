# frozen_string_literal: true

require "json"
require "open3"
require "rbconfig"

begin
  require "jekyll-admin"
rescue LoadError
  # Jekyll Admin is an optional development dependency.
end

if defined?(JekyllAdmin::Server)
  module NLOAdmin
    class StaticServer < Sinatra::Base
      set :public_folder, File.expand_path("../admin", __dir__)
      set :static, true
      CHART_WORKFLOW_PATH = File.expand_path("../.github/workflows/update-githubchart.yml", __dir__)
      CHART_GENERATOR_PATH = File.expand_path("../tools/generate-githubchart.sh", __dir__)
      COLOR_RE = /\A#[0-9a-fA-F]{6}\z/

      get "/" do
        send_file index_path
      end

      post "/_nlo/githubchart/apply" do
        content_type :json
        request_payload = request.body.read.to_s
        payload = parse_payload(request_payload)

        unless payload[:ok]
          status 400
          return JSON.generate(ok: false, error: payload[:error])
        end

        validation = validate_palette_payload(payload[:data])
        unless validation[:ok]
          status 422
          return JSON.generate(ok: false, error: validation[:error])
        end

        workflow_update = write_chart_palette_to_workflow(
          workflow_path: CHART_WORKFLOW_PATH,
          palette: validation[:palette],
          dark_levels: validation[:dark_levels],
          light_levels: validation[:light_levels]
        )

        unless workflow_update[:ok]
          status 500
          return JSON.generate(ok: false, error: workflow_update[:error])
        end

        rebuild = rebuild_chart_assets(
          palette: validation[:palette],
          dark_levels: validation[:dark_levels],
          light_levels: validation[:light_levels]
        )

        unless rebuild[:ok]
          status 500
          return JSON.generate(ok: false, error: rebuild[:error], output: rebuild[:output])
        end

        JSON.generate(
          ok: true,
          palette: validation[:palette],
          workflow_path: CHART_WORKFLOW_PATH,
          assets_rebuilt: true
        )
      end

      get "/*" do
        requested = params.fetch("splat", []).first.to_s

        # Some browsers/plugins can resolve admin API requests as /admin/_api/*.
        # Forward them to the actual mounted endpoint at /_api/*.
        if requested == "_api" || requested.start_with?("_api/")
          target = "/#{requested}"
          target = "#{target}?#{request.query_string}" unless request.query_string.to_s.empty?
          redirect target
        end

        file_path = File.expand_path(requested, settings.public_folder)

        if file_path.start_with?(settings.public_folder) && File.file?(file_path)
          send_file file_path
        else
          send_file index_path
        end
      end

      private

      def index_path
        @index_path ||= File.join(settings.public_folder, "index.html")
      end

      def parse_payload(raw_json)
        return { ok: false, error: "Request payload is empty" } if raw_json.empty?

        data = JSON.parse(raw_json)
        { ok: true, data: data }
      rescue JSON::ParserError
        { ok: false, error: "Invalid JSON payload" }
      end

      def validate_palette_payload(data)
        palette = data.fetch("palette", "").to_s.strip
        dark_levels = Array(data["dark"]).map { |item| item.to_s.strip }
        light_levels = Array(data["light"]).map { |item| item.to_s.strip }

        return { ok: false, error: "Palette is required" } if palette.empty?
        return { ok: false, error: "Dark palette must contain 5 hex colors" } unless dark_levels.size == 5
        return { ok: false, error: "Invalid dark palette color format" } unless dark_levels.all? { |color| color.match?(COLOR_RE) }

        unless light_levels.empty? || light_levels.size == 5
          return { ok: false, error: "Light palette must be empty or contain 5 hex colors" }
        end

        unless light_levels.empty? || light_levels.all? { |color| color.match?(COLOR_RE) }
          return { ok: false, error: "Invalid light palette color format" }
        end

        {
          ok: true,
          palette: palette,
          dark_levels: dark_levels,
          light_levels: light_levels
        }
      end

      def workflow_palette_block(indent:, palette:, dark_levels:, light_levels:)
        lines = []
        lines << "#{indent}# nlo-chart-palette:start"
        lines << "#{indent}GITHUBCHART_DARK_PALETTE: \"#{palette}\""

        dark_levels.each_with_index do |color, level|
          lines << "#{indent}GITHUBCHART_DARK_LEVEL#{level}: \"#{color}\""
        end

        if light_levels.size == 5
          light_levels.each_with_index do |color, level|
            lines << "#{indent}GITHUBCHART_LIGHT_LEVEL#{level}: \"#{color}\""
          end
        end

        lines << "#{indent}# nlo-chart-palette:end"
        lines.join("\n")
      end

      def write_chart_palette_to_workflow(workflow_path:, palette:, dark_levels:, light_levels:)
        unless File.file?(workflow_path)
          return { ok: false, error: "Workflow file not found: #{workflow_path}" }
        end

        content = File.read(workflow_path)
        marker_pattern = /^([ \t]*)# nlo-chart-palette:start[ \t]*$\n.*?^[ \t]*# nlo-chart-palette:end[ \t]*$/m
        fallback_pattern = /^([ \t]*)GITHUBCHART_DARK_PALETTE:.*$(?:\n\1GITHUBCHART_(?:DARK|LIGHT)_LEVEL\d:.*$)*/m

        updated_content =
          if (match = content.match(marker_pattern))
            block = workflow_palette_block(
              indent: match[1],
              palette: palette,
              dark_levels: dark_levels,
              light_levels: light_levels
            )
            content.sub(marker_pattern, block)
          elsif (match = content.match(fallback_pattern))
            block = workflow_palette_block(
              indent: match[1],
              palette: palette,
              dark_levels: dark_levels,
              light_levels: light_levels
            )
            content.sub(fallback_pattern, block)
          else
            return { ok: false, error: "Palette env block not found in workflow" }
          end

        File.write(workflow_path, updated_content) if updated_content != content
        { ok: true }
      end

      def rebuild_chart_assets(palette:, dark_levels:, light_levels:)
        unless File.file?(CHART_GENERATOR_PATH)
          return { ok: false, error: "Chart generator not found: #{CHART_GENERATOR_PATH}" }
        end

        project_root = File.expand_path("..", __dir__)
        env = {
          "GITHUBCHART_DARK_PALETTE" => palette,
          "GITHUBCHART_RUBY_BIN" => RbConfig.ruby
        }
        env["PATH"] = [Gem.bindir, File.dirname(RbConfig.ruby), ENV.fetch("PATH", "")].reject(&:empty?).join(":")

        dark_levels.each_with_index do |color, level|
          env["GITHUBCHART_DARK_LEVEL#{level}"] = color
        end

        if light_levels.size == 5
          light_levels.each_with_index do |color, level|
            env["GITHUBCHART_LIGHT_LEVEL#{level}"] = color
          end
        end

        stdout, stderr, status = Open3.capture3(env, CHART_GENERATOR_PATH, chdir: project_root)
        output = [stdout, stderr].compact.join("\n").strip

        if status.success?
          { ok: true, output: output }
        else
          {
            ok: false,
            error: "Failed to regenerate chart assets",
            output: output
          }
        end
      end
    end
  end

  module Jekyll
    module Commands
      class Serve < Command
        class << self
          private

          def jekyll_admin_monkey_patch
            Jekyll::External.require_with_graceful_fail "rackup"

            begin
              @server.unmount "/admin"
              @server.unmount "/_api"
            rescue StandardError
              nil
            end

            @server.mount "/admin", Rackup::Handler::WEBrick, NLOAdmin::StaticServer
            @server.mount "/_api", Rackup::Handler::WEBrick, JekyllAdmin::Server
            Jekyll.logger.info "JekyllAdmin mode:", ENV["RACK_ENV"] || "production"
            Jekyll.logger.info "JekyllAdmin UI:", "NLO fork (/admin from repository)"
          end
        end
      end
    end
  end
end
