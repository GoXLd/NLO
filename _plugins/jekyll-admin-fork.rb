# frozen_string_literal: true

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

      get "/" do
        send_file index_path
      end

      get "/*" do
        requested = params.fetch("splat", []).first.to_s
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
