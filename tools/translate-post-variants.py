#!/usr/bin/env python3
from __future__ import annotations

import re
import socket
import sys
import time
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Dict, List, Tuple

import yaml
from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
socket.setdefaulttimeout(20)


@dataclass
class Variant:
    source: Path
    target: Path
    source_lang: str
    target_lang: str
    target_locale: str


VARIANTS: List[Variant] = [
    Variant(
        ROOT / '_posts/2019-08-08-text-and-typography.md',
        ROOT / '_posts/2019-08-08-text-and-typography-ru.md',
        'en',
        'ru',
        'ru-RU',
    ),
    Variant(
        ROOT / '_posts/2019-08-08-text-and-typography.md',
        ROOT / '_posts/2019-08-08-text-and-typography-fr.md',
        'en',
        'fr',
        'fr-FR',
    ),
    Variant(
        ROOT / '_posts/2019-08-08-write-a-new-post.md',
        ROOT / '_posts/2019-08-08-write-a-new-post-ru.md',
        'en',
        'ru',
        'ru-RU',
    ),
    Variant(
        ROOT / '_posts/2019-08-08-write-a-new-post.md',
        ROOT / '_posts/2019-08-08-write-a-new-post-fr.md',
        'en',
        'fr',
        'fr-FR',
    ),
    Variant(
        ROOT / '_posts/2019-08-09-getting-started.md',
        ROOT / '_posts/2019-08-09-getting-started-ru.md',
        'en',
        'ru',
        'ru-RU',
    ),
    Variant(
        ROOT / '_posts/2019-08-09-getting-started.md',
        ROOT / '_posts/2019-08-09-getting-started-fr.md',
        'en',
        'fr',
        'fr-FR',
    ),
    Variant(
        ROOT / '_posts/2019-08-11-customize-the-favicon.md',
        ROOT / '_posts/2019-08-11-customize-the-favicon-ru.md',
        'en',
        'ru',
        'ru-RU',
    ),
    Variant(
        ROOT / '_posts/2019-08-11-customize-the-favicon.md',
        ROOT / '_posts/2019-08-11-customize-the-favicon-fr.md',
        'en',
        'fr',
        'fr-FR',
    ),
    Variant(
        ROOT / '_posts/2026-02-17-nlo-vs-chirpy-diff-log.md',
        ROOT / '_posts/2026-02-17-nlo-vs-chirpy-diff-log-en.md',
        'ru',
        'en',
        'en',
    ),
    Variant(
        ROOT / '_posts/2026-02-17-nlo-vs-chirpy-diff-log.md',
        ROOT / '_posts/2026-02-17-nlo-vs-chirpy-diff-log-fr.md',
        'ru',
        'fr',
        'fr-FR',
    ),
]

TOKEN_PATTERNS = [
    re.compile(r'!\[[^\]]*\]\([^\)]*\)'),
    re.compile(r'\[[^\]]*\]\([^\)]*\)'),
    re.compile(r'`[^`]*`'),
    re.compile(r'https?://\S+'),
    re.compile(r'\{\{[^\}]*\}\}'),
    re.compile(r'\{%[^%]*%\}'),
]


def split_front_matter(text: str) -> Tuple[dict, str]:
    if not text.startswith('---\n'):
        return {}, text

    marker = '\n---\n'
    idx = text.find(marker, 4)
    if idx < 0:
        return {}, text

    fm_text = text[4:idx]
    body = text[idx + len(marker) :]
    data = yaml.safe_load(fm_text) or {}
    return data, body


def normalize_yaml_values(value):
    if isinstance(value, (datetime, date)):
        return str(value)
    if isinstance(value, list):
        return [normalize_yaml_values(v) for v in value]
    if isinstance(value, dict):
        return {k: normalize_yaml_values(v) for k, v in value.items()}
    return value


def should_translate_text(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return False
    if len(stripped) > 280:
        return False
    if 'data:image/' in stripped:
        return False
    if re.search(r'[A-Za-z0-9+/]{80,}', stripped):
        return False
    if ' ' not in stripped and len(stripped) > 40:
        return False
    if re.match(r'^[-=*`~_#:.|{}\[\]()+/\\<>!0-9\s]+$', stripped):
        return False
    if re.match(r'^<https?://[^>]+>$', stripped):
        return False
    if stripped.startswith('{:') or stripped.startswith('<!--') or stripped.startswith('-->'):
        return False
    return True


def protect_tokens(text: str) -> Tuple[str, Dict[str, str]]:
    token_map: Dict[str, str] = {}
    working = text
    token_index = 0

    for pattern in TOKEN_PATTERNS:
        while True:
            match = pattern.search(working)
            if not match:
                break
            token = f'¤¤{token_index}¤¤'
            token_index += 1
            token_map[token] = match.group(0)
            working = working[: match.start()] + token + working[match.end() :]

    return working, token_map


def restore_tokens(text: str, token_map: Dict[str, str]) -> str:
    out = text
    ordered = sorted(
        token_map.items(),
        key=lambda pair: int(re.search(r'(\d+)', pair[0]).group(1)),
        reverse=True,
    )
    for token, original in ordered:
        out = out.replace(token, original)
    return out


def translate_text(text: str, translator: GoogleTranslator, cache: Dict[str, str]) -> str:
    key = f'{translator.source}:{translator.target}:{text}'
    if key in cache:
        return cache[key]

    protected, token_map = protect_tokens(text)
    if not should_translate_text(protected):
        restored = restore_tokens(protected, token_map)
        cache[key] = restored
        return restored

    for _ in range(2):
        try:
            translated = translator.translate(protected)
            restored = restore_tokens(translated, token_map)
            cache[key] = restored
            time.sleep(0.02)
            return restored
        except Exception:
            time.sleep(0.08)

    restored = restore_tokens(protected, token_map)
    cache[key] = restored
    return restored


def translate_table_row(line: str, translator: GoogleTranslator, cache: Dict[str, str]) -> str:
    stripped = line.strip()
    if re.match(r'^\|?\s*:?[-]{3,}', stripped):
        return line

    leading_pipe = line.startswith('|')
    trailing_pipe = line.rstrip('\n').endswith('|')
    raw_cells = line.strip('\n').strip('|').split('|')
    translated_cells = []

    for cell in raw_cells:
        content = cell.strip()
        if not content:
            translated_cells.append(cell)
            continue
        translated = translate_text(content, translator, cache)
        translated_cells.append(f' {translated} ')

    out = '|'.join(translated_cells)
    if leading_pipe:
        out = f'|{out}'
    if trailing_pipe:
        out = f'{out}|'
    return f'{out}\n'


def translate_line(line: str, translator: GoogleTranslator, cache: Dict[str, str], in_code: bool) -> Tuple[str, bool]:
    raw = line.rstrip('\n')

    if raw.strip().startswith('```'):
        return line, not in_code
    if in_code:
        return line, in_code

    if raw.strip().startswith('{:') or raw.strip().startswith('<!--') or raw.strip().startswith('-->'):
        return line, in_code

    m = re.match(r'^(\s*#{1,6}\s+)(.*)$', raw)
    if m:
        translated = translate_text(m.group(2), translator, cache)
        return f'{m.group(1)}{translated}\n', in_code

    m = re.match(r'^(\s*>\s+)(.*)$', raw)
    if m:
        translated = translate_text(m.group(2), translator, cache)
        return f'{m.group(1)}{translated}\n', in_code

    m = re.match(r'^(\s*(?:[-*+]|\d+\.)\s+(?:\[[ xX]\]\s+)?)(.*)$', raw)
    if m and not m.group(2).startswith('|'):
        translated = translate_text(m.group(2), translator, cache)
        return f'{m.group(1)}{translated}\n', in_code

    if raw.strip().startswith('|') and raw.strip().count('|') >= 2:
        return translate_table_row(line, translator, cache), in_code

    lead = len(raw) - len(raw.lstrip(' '))
    indent = raw[:lead]
    text = raw[lead:]
    translated = translate_text(text, translator, cache)
    return f'{indent}{translated}\n', in_code


def translate_body(body: str, translator: GoogleTranslator, cache: Dict[str, str]) -> str:
    lines = body.splitlines(keepends=True)
    out: List[str] = []
    in_code = False

    for line in lines:
        translated, in_code = translate_line(line, translator, cache, in_code)
        out.append(translated)

    return ''.join(out)


def translate_variant(variant: Variant, cache: Dict[str, str]) -> None:
    source_text = variant.source.read_text(encoding='utf-8')
    fm, body = split_front_matter(source_text)

    translator = GoogleTranslator(source=variant.source_lang, target=variant.target_lang)

    title = fm.get('title')
    if isinstance(title, str) and title.strip():
        fm['title'] = translate_text(title, translator, cache)

    description = fm.get('description')
    if isinstance(description, str) and description.strip():
        fm['description'] = translate_text(description, translator, cache)

    fm['language'] = variant.target_locale

    translated_body = translate_body(body, translator, cache)
    normalized_fm = normalize_yaml_values(fm)
    fm_out = yaml.safe_dump(normalized_fm, allow_unicode=True, sort_keys=False).strip()
    target_text = f'---\n{fm_out}\n---\n{translated_body}'
    variant.target.write_text(target_text, encoding='utf-8')
    print(f'Translated {variant.target.relative_to(ROOT)}', flush=True)


def main() -> int:
    cache: Dict[str, str] = {}
    for variant in VARIANTS:
        translate_variant(variant, cache)
    return 0


if __name__ == '__main__':
    sys.exit(main())
