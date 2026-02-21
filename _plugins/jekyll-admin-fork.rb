# frozen_string_literal: true

require "json"
require "open3"
require "rbconfig"
require "csv"
require "date"
require "yaml"
require "time"

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
      TRANSLATION_MATRIX_GENERATOR_PATH = File.expand_path("../tools/generate-translation-matrix.rb", __dir__)
      TRANSLATION_MATRIX_DOC_PATH = File.expand_path("../docs/translation-matrix.md", __dir__)
      TRANSLATION_MATRIX_CSV_PATH = File.expand_path("../docs/translation-matrix.csv", __dir__)
      CONFIG_PATH = File.expand_path("../_config.yml", __dir__)
      COLOR_RE = /\A#[0-9a-fA-F]{6}\z/
      AVATAR_FRAME_STYLES = %w[round discord].freeze

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

      post "/_nlo/avatar-frame/apply" do
        content_type :json
        request_payload = request.body.read.to_s
        payload = parse_payload(request_payload)

        unless payload[:ok]
          status 400
          return JSON.generate(ok: false, error: payload[:error])
        end

        validation = validate_avatar_frame_payload(payload[:data])
        unless validation[:ok]
          status 422
          return JSON.generate(ok: false, error: validation[:error])
        end

        config_update = write_avatar_frame_to_config(config_path: CONFIG_PATH, style: validation[:style])
        unless config_update[:ok]
          status 500
          return JSON.generate(ok: false, error: config_update[:error])
        end

        JSON.generate(ok: true, style: validation[:style], config_path: CONFIG_PATH)
      end

      post "/_nlo/translation-matrix/generate" do
        content_type :json

        result = rebuild_translation_matrix
        unless result[:ok]
          status 500
          return JSON.generate(ok: false, error: result[:error], output: result[:output])
        end

        JSON.generate(
          ok: true,
          markdown_path: TRANSLATION_MATRIX_DOC_PATH,
          csv_path: TRANSLATION_MATRIX_CSV_PATH,
          output: result[:output]
        )
      end

      get "/_nlo/translation-matrix/data" do
        content_type :json

        result = rebuild_translation_matrix
        unless result[:ok]
          status 500
          return JSON.generate(ok: false, error: result[:error], output: result[:output])
        end

        payload = translation_matrix_payload
        unless payload[:ok]
          status 500
          return JSON.generate(ok: false, error: payload[:error])
        end

        JSON.generate(ok: true, data: payload[:data])
      end

      get "/translation-matrix" do
        page_path = File.join(settings.public_folder, "translation-matrix.html")
        if File.file?(page_path)
          send_file page_path
        else
          send_file index_path
        end
      end

      get "/_nlo/translation-matrix.md" do
        serve_translation_matrix_file(
          file_path: TRANSLATION_MATRIX_DOC_PATH,
          mime_type: "text/markdown",
          file_name: "translation-matrix.md"
        )
      end

      get "/_nlo/translation-matrix.csv" do
        serve_translation_matrix_file(
          file_path: TRANSLATION_MATRIX_CSV_PATH,
          mime_type: "text/csv",
          file_name: "translation-matrix.csv"
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

      def validate_avatar_frame_payload(data)
        style = data.fetch("style", "").to_s.strip.downcase
        return { ok: false, error: "Avatar frame style is required" } if style.empty?
        return { ok: false, error: "Unsupported avatar frame style" } unless AVATAR_FRAME_STYLES.include?(style)

        { ok: true, style: style }
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

      def rebuild_translation_matrix
        unless File.file?(TRANSLATION_MATRIX_GENERATOR_PATH)
          return {
            ok: false,
            error: "Translation matrix generator not found: #{TRANSLATION_MATRIX_GENERATOR_PATH}"
          }
        end

        project_root = File.expand_path("..", __dir__)
        env = {}
        env["PATH"] = [Gem.bindir, File.dirname(RbConfig.ruby), ENV.fetch("PATH", "")].reject(&:empty?).join(":")

        stdout, stderr, status = Open3.capture3(
          env,
          RbConfig.ruby,
          TRANSLATION_MATRIX_GENERATOR_PATH,
          chdir: project_root
        )
        output = [stdout, stderr].compact.join("\n").strip

        unless status.success?
          return {
            ok: false,
            error: "Failed to generate translation matrix",
            output: output
          }
        end

        unless File.file?(TRANSLATION_MATRIX_DOC_PATH) && File.file?(TRANSLATION_MATRIX_CSV_PATH)
          return {
            ok: false,
            error: "Translation matrix files were not created",
            output: output
          }
        end

        { ok: true, output: output }
      end

      def translation_matrix_payload
        unless File.file?(TRANSLATION_MATRIX_CSV_PATH)
          return { ok: false, error: "Translation matrix CSV not found" }
        end

        config = YAML.safe_load(File.read(CONFIG_PATH), permitted_classes: [Date, Time], aliases: true) || {}
        languages = normalize_language_list(config["lang"])
        languages = ["en"] if languages.empty?

        rows = CSV.read(TRANSLATION_MATRIX_CSV_PATH, headers: true)
        items = rows.map { |row| build_translation_matrix_row(row, languages) }

        {
          ok: true,
          data: {
            generated_at: File.mtime(TRANSLATION_MATRIX_CSV_PATH).utc.iso8601,
            languages: languages,
            total_groups: items.length,
            items: items
          }
        }
      rescue StandardError => e
        { ok: false, error: "Failed to build translation matrix payload: #{e.message}" }
      end

      def normalize_language_list(value)
        raw =
          case value
          when Array
            value
          when String
            value.split(",")
          else
            []
          end

        raw.map { |entry| entry.to_s.strip }.reject(&:empty?).uniq
      end

      def parse_integer(value)
        Integer(value)
      rescue StandardError
        nil
      end

      def csv_list(value)
        value.to_s.split(";").map(&:strip).reject(&:empty?)
      end

      def build_translation_matrix_row(row, languages)
        by_language = {}
        source_language = row["source_language"].to_s.strip
        source_language = languages.first.to_s if source_language.empty?
        source_revision = parse_integer(row["source_revision"]) || 1

        languages.each do |language|
          token = language.gsub(/[^a-zA-Z0-9]/, "_")
          files = csv_list(row["files_#{token}"])
          legacy_available = row["has_#{token}"].to_s == "1"
          status_token = row["status_#{token}"].to_s.strip
          revision_token = parse_integer(row["revision_#{token}"])

          status =
            if status_token.empty?
              if legacy_available
                language == source_language ? "source" : "up_to_date"
              else
                "missing"
              end
            else
              status_token
            end

          available = status != "missing"
          revision = available ? revision_token : nil

          by_language[language] = {
            available: available,
            files: files,
            status: status,
            revision: revision,
            primary_file: row["primary_file_#{token}"].to_s.strip.empty? ? files.first.to_s : row["primary_file_#{token}"].to_s.strip
          }
        end

        missing_languages = csv_list(row["missing_languages"])
        outdated_languages = csv_list(row["outdated_languages"])
        untracked_languages = csv_list(row["untracked_languages"])

        if outdated_languages.empty?
          outdated_languages = by_language
            .select { |_lang, data| data[:status] == "outdated" }
            .keys
        end

        if untracked_languages.empty?
          untracked_languages = by_language
            .select { |_lang, data| data[:status] == "untracked" }
            .keys
        end

        {
          translation_key: row["translation_key"].to_s,
          title: row["title"].to_s,
          source_language: source_language,
          source_revision: source_revision,
          source_file: row["source_file"].to_s,
          by_language: by_language,
          missing_languages: missing_languages,
          outdated_languages: outdated_languages,
          untracked_languages: untracked_languages
        }
      end

      def serve_translation_matrix_file(file_path:, mime_type:, file_name:)
        unless File.file?(file_path)
          status 404
          content_type :json
          return JSON.generate(ok: false, error: "File not found: #{file_name}")
        end

        content_type mime_type, charset: "utf-8"
        headers "Content-Disposition" => %(inline; filename="#{file_name}")
        send_file file_path
      end

      def write_avatar_frame_to_config(config_path:, style:)
        unless File.file?(config_path)
          return { ok: false, error: "Config file not found: #{config_path}" }
        end

        content = File.read(config_path)
        updated_content = upsert_avatar_frame(content, style)
        return { ok: false, error: "Could not locate nlo.branding in _config.yml" } unless updated_content

        File.write(config_path, updated_content) if updated_content != content
        { ok: true }
      end

      def upsert_avatar_frame(content, style)
        lines = content.lines
        nlo_index = find_key_index(lines, 0, lines.length, "nlo")
        return nil unless nlo_index

        nlo_indent = line_indent(lines[nlo_index])
        nlo_end = block_end_index(lines, nlo_index + 1, nlo_indent)
        branding_index = find_key_index(lines, nlo_index + 1, nlo_end, "branding")
        return nil unless branding_index

        branding_indent = line_indent(lines[branding_index])
        branding_end = block_end_index(lines, branding_index + 1, branding_indent)
        avatar_frame_index = find_key_index(lines, branding_index + 1, branding_end, "avatar_frame")

        value_indent = " " * (branding_indent + 2)
        avatar_frame_line = "#{value_indent}avatar_frame: #{style} # [round | discord]\n"

        if avatar_frame_index
          lines[avatar_frame_index] = avatar_frame_line
        else
          lines.insert(branding_end, avatar_frame_line)
        end

        lines.join
      end

      def find_key_index(lines, start_idx, end_idx, key)
        key_pattern = /^\s*#{Regexp.escape(key)}:\s*(?:#.*)?$/
        (start_idx...end_idx).find { |idx| lines[idx].match?(key_pattern) }
      end

      def block_end_index(lines, start_idx, parent_indent)
        idx = start_idx

        while idx < lines.length
          stripped = lines[idx].strip
          if stripped.empty? || stripped.start_with?("#")
            idx += 1
            next
          end

          break if line_indent(lines[idx]) <= parent_indent

          idx += 1
        end

        idx
      end

      def line_indent(line)
        line[/\A[ \t]*/].size
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
