#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
config_file="$root_dir/_config.yml"
output_dir="${1:-$root_dir/assets/img}"

light_main="$output_dir/githubchart.svg"
light_sidebar="$output_dir/githubchart-sidebar.svg"
dark_main="$output_dir/githubchart-dark.svg"
dark_sidebar="$output_dir/githubchart-sidebar-dark.svg"

color_light="${GITHUBCHART_COLOR_LIGHT:-#295170}"
color_dark="${GITHUBCHART_COLOR_DARK:-#7aa2ff}"
zero_light="${GITHUBCHART_ZERO_LIGHT:-#eeeeee}"
zero_dark="${GITHUBCHART_ZERO_DARK:-#2d333b}"
text_light="${GITHUBCHART_TEXT_LIGHT:-#767676}"
text_dark="${GITHUBCHART_TEXT_DARK:-#8b949e}"

github_user="${GITHUB_USER:-}"
if [[ -z "$github_user" && -f "$config_file" ]]; then
  github_user="$(ruby -e 'require "yaml"; cfg = YAML.load_file(ARGV[0]); puts(cfg.dig("github","username") || "")' "$config_file")"
fi

if [[ -z "$github_user" || "$github_user" == "github_username" ]]; then
  echo "github.username not found in _config.yml (or set GITHUB_USER)." >&2
  exit 1
fi

mkdir -p "$output_dir"
tmp_raw="$(mktemp "${TMPDIR:-/tmp}/githubchart-raw.XXXXXX.svg")"
trap 'rm -f "$tmp_raw"' EXIT

bundle exec githubchart -u "$github_user" "$tmp_raw"

GITHUBCHART_INPUT="$tmp_raw" \
GITHUBCHART_LIGHT_MAIN="$light_main" \
GITHUBCHART_LIGHT_SIDEBAR="$light_sidebar" \
GITHUBCHART_DARK_MAIN="$dark_main" \
GITHUBCHART_DARK_SIDEBAR="$dark_sidebar" \
GITHUBCHART_COLOR_LIGHT="$color_light" \
GITHUBCHART_COLOR_DARK="$color_dark" \
GITHUBCHART_ZERO_LIGHT="$zero_light" \
GITHUBCHART_ZERO_DARK="$zero_dark" \
GITHUBCHART_TEXT_LIGHT="$text_light" \
GITHUBCHART_TEXT_DARK="$text_dark" \
python3 - <<'PY'
import copy
import os
import xml.etree.ElementTree as ET
from pathlib import Path

input_path = Path(os.environ["GITHUBCHART_INPUT"])
light_main = Path(os.environ["GITHUBCHART_LIGHT_MAIN"])
light_sidebar = Path(os.environ["GITHUBCHART_LIGHT_SIDEBAR"])
dark_main = Path(os.environ["GITHUBCHART_DARK_MAIN"])
dark_sidebar = Path(os.environ["GITHUBCHART_DARK_SIDEBAR"])

color_light = os.environ.get("GITHUBCHART_COLOR_LIGHT", "#295170")
color_dark = os.environ.get("GITHUBCHART_COLOR_DARK", "#7aa2ff")
zero_light = os.environ.get("GITHUBCHART_ZERO_LIGHT", "#eeeeee")
zero_dark = os.environ.get("GITHUBCHART_ZERO_DARK", "#2d333b")
text_light = os.environ.get("GITHUBCHART_TEXT_LIGHT", "#767676")
text_dark = os.environ.get("GITHUBCHART_TEXT_DARK", "#8b949e")

raw_tree = ET.parse(input_path)

def tag_name(el):
    return el.tag.split("}")[-1]

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip("#")
    return tuple(int(hex_str[i : i + 2], 16) for i in (0, 2, 4))

def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)

def mix_with_white(rgb, ratio):
    return tuple(int(round(255 * (1 - ratio) + channel * ratio)) for channel in rgb)

def update_fill(el, color):
    style = el.get("style")
    if style:
        parts = [p for p in style.split(";") if p]
        style_map = {}
        for part in parts:
            if ":" in part:
                key, value = part.split(":", 1)
                style_map[key.strip()] = value.strip()
        style_map["fill"] = color
        el.set("style", ";".join(f"{k}:{v}" for k, v in style_map.items()))
    else:
        el.set("fill", color)

def build_palette(base_hex, zero_hex):
    base_rgb = hex_to_rgb(base_hex)
    return {
        "0": zero_hex,
        "1": rgb_to_hex(mix_with_white(base_rgb, 0.25)),
        "2": rgb_to_hex(mix_with_white(base_rgb, 0.45)),
        "3": rgb_to_hex(mix_with_white(base_rgb, 0.7)),
        "4": rgb_to_hex(base_rgb),
    }

def crop_for_sidebar(root):
    for parent in root.iter():
        for child in list(parent):
            if tag_name(child) == "text":
                parent.remove(child)

    min_x = min_y = None
    max_x = max_y = None

    for rect in root.iter():
        if tag_name(rect) != "rect":
            continue
        try:
            x = float(rect.get("x", "0"))
            y = float(rect.get("y", "0"))
            w = float(rect.get("width", "0"))
            h = float(rect.get("height", "0"))
        except ValueError:
            continue

        if min_x is None:
            min_x, min_y, max_x, max_y = x, y, x + w, y + h
            continue

        min_x = min(min_x, x)
        min_y = min(min_y, y)
        max_x = max(max_x, x + w)
        max_y = max(max_y, y + h)

    if min_x is not None:
        width = max_x - min_x
        height = max_y - min_y
        root.set("viewBox", f"{min_x} {min_y} {width} {height}")
        root.set("width", f"{width}")
        root.set("height", f"{height}")

def render_mode(main_path, sidebar_path, palette, label_color):
    tree = copy.deepcopy(raw_tree)
    root = tree.getroot()

    for node in root.iter():
        name = tag_name(node)
        if name == "rect":
            score = node.get("data-score")
            if score in palette:
                update_fill(node, palette[score])
        elif name == "text":
            update_fill(node, label_color)

    tree.write(main_path, encoding="utf-8", xml_declaration=True)

    sidebar_tree = copy.deepcopy(tree)
    sidebar_root = sidebar_tree.getroot()
    crop_for_sidebar(sidebar_root)
    sidebar_tree.write(sidebar_path, encoding="utf-8", xml_declaration=True)

light_palette = build_palette(color_light, zero_light)
dark_palette = build_palette(color_dark, zero_dark)

render_mode(light_main, light_sidebar, light_palette, text_light)
render_mode(dark_main, dark_sidebar, dark_palette, text_dark)
PY

echo "Wrote $light_main"
echo "Wrote $light_sidebar"
echo "Wrote $dark_main"
echo "Wrote $dark_sidebar"
