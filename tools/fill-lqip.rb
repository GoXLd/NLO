#!/usr/bin/env ruby
# frozen_string_literal: true
#
# fill-lqip.rb — auto-fill `image.lqip` in post front matter.
#
# For every post that declares `image.path` but no `image.lqip`, generate the
# placeholder with tools/generate-lqip.sh and insert it right after the path
# line (comments and formatting are left untouched). Idempotent: posts that
# already have an lqip are skipped.
#
# Usage:
#   tools/fill-lqip.rb                 # scan _posts/**/*.md
#   tools/fill-lqip.rb a.md b.md ...   # only the given files (e.g. staged)
#
# Skips silently (exit 0) if the image file or the generator's tools are
# missing, so it is safe to wire into a git hook.

require 'yaml'

ROOT = File.expand_path('..', __dir__)
GEN  = File.join(ROOT, 'tools', 'generate-lqip.sh')
FM   = /\A---\s*\n(.*?\n)^---\s*\n/m # front matter block

files = ARGV.empty? ? Dir[File.join(ROOT, '_posts', '**', '*.md')] : ARGV
changed = 0

files.each do |file|
  text = File.read(file, encoding: 'UTF-8')
  m = text.match(FM) or next
  fm = begin
    YAML.safe_load(m[1], permitted_classes: [Date, Time])
  rescue StandardError
    next
  end
  img = fm && fm['image']
  next unless img.is_a?(Hash)
  next unless img['path'] && !img['lqip']

  rel = img['path'].to_s.sub(%r{\A/}, '')
  asset = File.join(ROOT, rel)
  unless File.file?(asset)
    warn "fill-lqip: image not found for #{File.basename(file)}: #{img['path']}"
    next
  end

  lqip = `#{GEN.dump} #{asset.dump}`.strip
  next if $?.exitstatus != 0 || lqip.empty? # tool missing / failed → skip

  # Insert `lqip:` right after the `path:` line, matching its indentation.
  fm_text = m[1]
  new_fm = fm_text.sub(/^(\s*)path:.*\n/) { "#{$~[0]}#{$1}lqip: #{lqip}\n" }
  next if new_fm == fm_text

  File.write(file, text.sub(fm_text, new_fm))
  changed += 1
  puts "fill-lqip: added lqip to #{File.basename(file)}"
end

puts "fill-lqip: nothing to do" if changed.zero?
