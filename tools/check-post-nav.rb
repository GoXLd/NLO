# frozen_string_literal: true

require "jekyll"
require "nokogiri"

destination = File.expand_path(ARGV.fetch(0))
site = Jekyll::Site.new(Jekyll.configuration("destination" => destination))
site.read

default_lang = site.config.fetch("lang", "en").to_s.split(",").first.strip
posts_by_url = site.posts.docs.to_h { |post| ["#{site.baseurl}#{post.url}", post] }

site.posts.docs.each do |post|
  document = Nokogiri::HTML(File.read(post.destination(destination)))
  source_lang = post.data["language"] || post.data["lang"] || default_lang

  document.css(".post-navigation a[href]").each do |link|
    target = posts_by_url.fetch(link["href"])
    target_lang = target.data["language"] || target.data["lang"] || default_lang
    abort "#{post.url} links to #{target.url} in #{target_lang}" unless target_lang == source_lang
  end
end
