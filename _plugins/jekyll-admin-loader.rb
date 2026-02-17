# frozen_string_literal: true

# Load Jekyll Admin in local/dev environments when the gem is available.
begin
  require "jekyll-admin"
rescue LoadError
  # Ignore when running environments without the optional dev dependency.
end
