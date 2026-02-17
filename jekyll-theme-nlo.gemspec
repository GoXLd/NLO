# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "jekyll-theme-nlo"
  spec.version       = "7.4.1"
  spec.authors       = ["Alexandre Vandemoortele", "Cotes Chung"]
  spec.email         = ["alex.vande@yahoo.com", "cotes.chung@gmail.com"]

  spec.summary       = "A minimal, responsive, and feature-rich Jekyll theme for technical writing."
  spec.homepage      = "https://github.com/GoXLd/NLO"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f|
    f.match(%r!^((_(includes|layouts|sass|(data\/(locales|origin)))|assets)\/|README|NOTICE|LICENSE)!i)
  }

  spec.metadata = {
    "bug_tracker_uri"   => "https://github.com/GoXLd/NLO/issues",
    "documentation_uri" => "https://github.com/GoXLd/NLO#readme",
    "homepage_uri"      => "https://github.com/GoXLd/NLO",
    "source_code_uri"   => "https://github.com/GoXLd/NLO",
    "wiki_uri"          => "https://github.com/GoXLd/NLO/wiki",
    "plugin_type"       => "theme"
  }

  spec.required_ruby_version = "~> 3.1"

  spec.add_runtime_dependency "jekyll", "~> 4.3"
  spec.add_runtime_dependency "jekyll-paginate", "~> 1.1"
  spec.add_runtime_dependency "jekyll-seo-tag", "~> 2.8"
  spec.add_runtime_dependency "jekyll-archives", "~> 2.2"
  spec.add_runtime_dependency "jekyll-sitemap", "~> 1.4"
  spec.add_runtime_dependency "jekyll-include-cache", "~> 0.2"

end
