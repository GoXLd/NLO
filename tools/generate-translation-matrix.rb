#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require "date"
require "fileutils"
require "time"
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


def parse_integer(value)
  Integer(value)
rescue StandardError
  nil
end


def parse_timestamp(value)
  return nil if value.nil?

  return value.to_time if value.respond_to?(:to_time)

  Time.parse(value.to_s)
rescue StandardError
  nil
end


def language_token(language)
  language.gsub(/[^a-zA-Z0-9]/, "_")
end


def source_entry_for(group, default_lang)
  marked = group[:entries].select { |entry| entry[:translation_source] }
  return marked.sort_by { |entry| [entry[:last_modified].to_i, entry[:file]] }.last unless marked.empty?

  default_entries = group[:entries].select { |entry| entry[:lang] == default_lang }
  return default_entries.sort_by { |entry| [entry[:last_modified].to_i, entry[:file]] }.last unless default_entries.empty?

  group[:entries].sort_by { |entry| [entry[:last_modified].to_i, entry[:file]] }.last
end


def primary_entry_for_lang(entries:, source_entry:, source_lang:, lang:)
  return nil if entries.empty?
  return source_entry if lang == source_lang && entries.include?(source_entry)

  entries.sort_by do |entry|
    [entry[:translated_rev] || 0, entry[:last_modified].to_i, entry[:file]]
  end.last
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
  last_modified = parse_timestamp(front_matter["last_modified_at"]) ||
    parse_timestamp(front_matter["date"]) ||
    File.mtime(path)

  entry = {
    file: "_posts/#{filename}",
    title: post_title,
    slug: slug,
    lang: post_lang,
    date: post_date,
    last_modified: last_modified,
    translation_source: front_matter["translation_source"] == true,
    translation_rev: parse_integer(front_matter["translation_rev"]),
    translated_rev: parse_integer(front_matter["translated_rev"])
  }

  group = groups[translation_key] ||= {
    key: translation_key,
    slug: slug,
    title: post_title,
    date: post_date,
    entries: [],
    by_lang: Hash.new { |h, k| h[k] = [] }
  }

  if group[:date].to_s.empty? || (!post_date.to_s.empty? && post_date.to_s < group[:date].to_s)
    group[:date] = post_date
  end

  if post_lang == "en" || group[:title].to_s.empty?
    group[:title] = post_title
  end

  group[:entries] << entry
  group[:by_lang][post_lang] << entry
end

sorted_groups = groups.values.sort_by { |group| [group[:date].to_s, group[:key]] }
rows = []

sorted_groups.each do |group|
  source_entry = source_entry_for(group, default_lang)
  source_lang = source_entry[:lang]
  source_revision = source_entry[:translation_rev] || 1
  revision_tracking_enabled =
    !source_entry[:translation_rev].nil? ||
    group[:entries].any? { |entry| !entry[:translated_rev].nil? }

  by_language = {}
  missing_languages = []
  outdated_languages = []
  untracked_languages = []

  configured_langs.each do |lang|
    entries = group[:by_lang][lang]

    if entries.empty?
      missing_languages << lang
      by_language[lang] = {
        status: "missing",
        has: false,
        revision: nil,
        files: []
      }
      next
    end

    primary = primary_entry_for_lang(entries: entries, source_entry: source_entry, source_lang: source_lang, lang: lang)

    if lang == source_lang
      status = "source"
      revision = source_revision
    else
      translated_revision = primary[:translated_rev]
      if translated_revision.nil?
        status = revision_tracking_enabled ? "outdated" : "untracked"
        revision = nil
      else
        status = translated_revision >= source_revision ? "up_to_date" : "outdated"
        revision = translated_revision
      end
      outdated_languages << lang if status == "outdated"
      untracked_languages << lang if status == "untracked"
    end

    by_language[lang] = {
      status: status,
      has: true,
      revision: revision,
      files: entries.map { |entry| entry[:file] },
      primary_file: primary[:file],
      primary_title: primary[:title]
    }
  end

  rows << {
    key: group[:key],
    title: group[:title],
    source_language: source_lang,
    source_revision: source_revision,
    source_file: source_entry[:file],
    by_language: by_language,
    missing_languages: missing_languages,
    outdated_languages: outdated_languages,
    untracked_languages: untracked_languages
  }
end

FileUtils.mkdir_p(File.dirname(OUTPUT_MD))

File.open(OUTPUT_MD, "w") do |file|
  generated_at = Time.now.utc.strftime("%Y-%m-%d %H:%M:%S UTC")
  file.puts "# Translation Matrix"
  file.puts
  file.puts "Generated automatically by `tools/generate-translation-matrix.rb`."
  file.puts "Updated at: #{generated_at}"
  file.puts
  file.puts "- Configured languages: #{configured_langs.join(', ')}"
  file.puts "- Total article groups: #{rows.size}"
  file.puts

  header = ["Translation Key", "Title", "Source", "Revision"] + configured_langs + ["Missing", "Outdated", "Untracked"]
  separator = Array.new(header.size, "---")

  file.puts "| #{header.join(' | ')} |"
  file.puts "| #{separator.join(' | ')} |"

  rows.each do |row|
    cells = []
    cells << "`#{row[:key]}`"
    cells << row[:title].gsub("|", "\\|")
    cells << row[:source_language]
    cells << "r#{row[:source_revision]}"

    configured_langs.each do |lang|
      lang_data = row[:by_language][lang]

      if lang_data[:status] == "missing"
        cells << "—"
        next
      end

      link = "[#{lang_data[:primary_title]}](../#{lang_data[:primary_file]})"

      label =
        case lang_data[:status]
        when "source"
          "SOURCE r#{row[:source_revision]}"
        when "up_to_date"
          "✅ r#{lang_data[:revision]}"
        when "untracked"
          "UNTRACKED"
        else
          lang_data[:revision].nil? ? "⚠ need r#{row[:source_revision]}" : "⚠ r#{lang_data[:revision]}/r#{row[:source_revision]}"
        end

      cells << "#{link} · #{label}"
    end

    cells << (row[:missing_languages].empty? ? "✅" : row[:missing_languages].join(", "))
    cells << (row[:outdated_languages].empty? ? "✅" : row[:outdated_languages].join(", "))
    cells << (row[:untracked_languages].empty? ? "✅" : row[:untracked_languages].join(", "))

    file.puts "| #{cells.join(' | ')} |"
  end
end

csv_headers = [
  "translation_key",
  "title",
  "source_language",
  "source_revision",
  "source_file"
]

configured_langs.each do |lang|
  token = language_token(lang)
  csv_headers << "status_#{token}"
  csv_headers << "has_#{token}"
  csv_headers << "revision_#{token}"
  csv_headers << "files_#{token}"
  csv_headers << "primary_file_#{token}"
end

csv_headers += ["missing_languages", "outdated_languages", "untracked_languages"]

CSV.open(OUTPUT_CSV, "w", write_headers: true, headers: csv_headers) do |csv|
  rows.each do |row|
    data = [
      row[:key],
      row[:title],
      row[:source_language],
      row[:source_revision],
      row[:source_file]
    ]

    configured_langs.each do |lang|
      token = language_token(lang)
      lang_data = row[:by_language][lang]
      files = lang_data[:files] || []

      data << lang_data[:status]
      data << (lang_data[:has] ? "1" : "0")
      data << (lang_data[:revision].nil? ? "" : lang_data[:revision].to_s)
      data << files.join(";")
      data << lang_data[:primary_file].to_s
    end

    data << row[:missing_languages].join(";")
    data << row[:outdated_languages].join(";")
    data << row[:untracked_languages].join(";")

    csv << data
  end
end

puts "Generated:"
puts "- #{OUTPUT_MD}"
puts "- #{OUTPUT_CSV}"
