#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "date"
require "fileutils"
require "yaml"

ROOT = File.expand_path("..", __dir__)
POSTS_DIR = File.join(ROOT, "_posts")
LOCALES_DIR = File.join(ROOT, "_data", "locales")
CONFIG_PATH = File.join(ROOT, "_config.yml")
OUTPUT_MD = File.join(ROOT, "docs", "translation-matrix.md")
OUTPUT_CSV = File.join(ROOT, "docs", "translation-matrix.csv")

def load_yaml(path)
  YAML.safe_load(File.read(path), permitted_classes: [Date, Time], aliases: true) || {}
rescue StandardError => e
  warn "Failed to parse YAML from #{path}: #{e.message}"
  {}
end

def parse_front_matter(path)
  content = File.read(path)
  match = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  return {} unless match

  YAML.safe_load(match[1], permitted_classes: [Date, Time], aliases: true) || {}
rescue StandardError => e
  warn "Failed to parse front matter in #{path}: #{e.message}"
  {}
end

def resolve_locale(code, locale_keys)
  raw = code.to_s.strip
  return nil if raw.empty?

  down = raw.downcase
  exact = locale_keys.find { |key| key.downcase == down }
  return exact if exact

  prefixed = locale_keys.find { |key| key.downcase.start_with?("#{down}-") }
  return prefixed if prefixed

  alias_code = down.split("-").first
  locale_keys.find do |key|
    key_down = key.downcase
    key_down == alias_code || key_down.start_with?("#{alias_code}-")
  end
end

def normalize_lang_list(config_lang)
  case config_lang
  when Array
    config_lang
  when String
    config_lang.split(",")
  else
    []
  end
end

locale_keys = Dir.glob(File.join(LOCALES_DIR, "*.yml"))
  .map { |path| File.basename(path, ".yml") }
  .sort

config = load_yaml(CONFIG_PATH)
configured_raw_langs = normalize_lang_list(config["lang"])

configured_langs = configured_raw_langs
  .map { |lang| resolve_locale(lang, locale_keys) }
  .compact
  .uniq

configured_langs = ["en"] if configured_langs.empty?
default_lang = configured_langs.first

groups = {}

Dir.glob(File.join(POSTS_DIR, "*.md")).sort.each do |path|
  front_matter = parse_front_matter(path)
  filename = File.basename(path)
  slug = filename.sub(/^\d{4}-\d{2}-\d{2}-/, "").sub(/\.md$/, "")

  translation_key = front_matter["translation_key"].to_s.strip
  translation_key = slug if translation_key.empty?

  post_lang = resolve_locale(front_matter["language"] || front_matter["lang"], locale_keys) || default_lang
  post_title = front_matter["title"].to_s.strip
  post_title = slug.tr("-", " ") if post_title.empty?
  post_date = front_matter["date"].to_s

  group = groups[translation_key] ||= {
    key: translation_key,
    slug: slug,
    title: post_title,
    date: post_date,
    by_lang: {}
  }

  if group[:date].to_s.empty? || (!post_date.to_s.empty? && post_date.to_s < group[:date].to_s)
    group[:date] = post_date
  end

  if post_lang == "en" || group[:title].to_s.empty?
    group[:title] = post_title
  end

  group[:by_lang][post_lang] ||= []
  group[:by_lang][post_lang] << {
    file: "_posts/#{filename}",
    title: post_title,
    slug: slug
  }
end

sorted_groups = groups.values.sort_by { |group| [group[:date].to_s, group[:key]] }

FileUtils.mkdir_p(File.dirname(OUTPUT_MD))

File.open(OUTPUT_MD, "w") do |file|
  generated_at = Time.now.utc.strftime("%Y-%m-%d %H:%M:%S UTC")
  file.puts "# Translation Matrix"
  file.puts
  file.puts "Generated automatically by `tools/generate-translation-matrix.rb`."
  file.puts "Updated at: #{generated_at}"
  file.puts
  file.puts "- Configured languages: #{configured_langs.join(', ')}"
  file.puts "- Total article groups: #{sorted_groups.size}"
  file.puts

  header = ["Translation Key", "Title"] + configured_langs + ["Missing"]
  separator = Array.new(header.size, "---")

  file.puts "| #{header.join(' | ')} |"
  file.puts "| #{separator.join(' | ')} |"

  sorted_groups.each do |group|
    cells = []
    cells << "`#{group[:key]}`"
    cells << group[:title].gsub("|", "\\|")

    configured_langs.each do |lang|
      entries = group[:by_lang][lang] || []
      if entries.empty?
        cells << " "
      else
        links = entries.map { |entry| "[#{entry[:title]}](../#{entry[:file]})" }
        cells << links.join("<br>")
      end
    end

    available = configured_langs.select { |lang| group[:by_lang].key?(lang) && !group[:by_lang][lang].empty? }
    missing = configured_langs - available
    cells << (missing.empty? ? "\u2705" : missing.join(", "))

    file.puts "| #{cells.join(' | ')} |"
  end
end

csv_headers = ["translation_key", "title"] +
  configured_langs.map { |lang| "has_#{lang.gsub(/[^a-zA-Z0-9]/, '_')}" } +
  configured_langs.map { |lang| "files_#{lang.gsub(/[^a-zA-Z0-9]/, '_')}" } +
  ["missing_languages"]

CSV.open(OUTPUT_CSV, "w", write_headers: true, headers: csv_headers) do |csv|
  sorted_groups.each do |group|
    row = [group[:key], group[:title]]

    configured_langs.each do |lang|
      row << ((group[:by_lang][lang] && !group[:by_lang][lang].empty?) ? "1" : "0")
    end

    configured_langs.each do |lang|
      entries = group[:by_lang][lang] || []
      files = entries.map { |entry| entry[:file] }
      row << files.join(";")
    end

    available = configured_langs.select { |lang| group[:by_lang].key?(lang) && !group[:by_lang][lang].empty? }
    missing = configured_langs - available
    row << missing.join(";")

    csv << row
  end
end

puts "Generated:"
puts "- #{OUTPUT_MD}"
puts "- #{OUTPUT_CSV}"
