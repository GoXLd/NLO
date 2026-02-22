---
title: 'NLO vs Chirpy: Diff Log'
language: en
translation_key: nlo-vs-chirpy-diff-log
description: An objective list of differences between the NLO theme and the original
  jekyll-theme-chirpy. The post is updated as the migration progresses and the topic
  develops.
date: 2026-02-17 12:30:00 +0100
categories:
- NLO
- Migration
tags:
- nlo
- chirpy
- changelog
---

![](assets/img/logo_nlo.png)
This post documents **specific technical differences** from the original thread.
The format is simple: we add an item when it is implemented and verified.

## Checklist of differences

- [x] Personal statistics GitHub contribution graph (home + sidebar) with auto-update via workflow
- [x] Local admin panel for content editing, based on `jekyll-admin`, with UI fork inside the project
- [x] Quick login to the local admin panel via a separate button in the sidebar (dev only)
- [x] Extended sidebar branding: different avatars for light/dark + choice of frame style
- [x] Multilingual mode in `lang` with language switcher and flags in the sidebar
- [x] Short locale URL prefixes (`/ru/`, `/fr/`) instead of long ones (`/ru-RU/`, `/fr-FR/`)
- [x] Content filtering by post language (`language`/`lang` in front matter)

## 1) Personal statistics of GitHub contributions

What's added:

- Display GitHub contribution chart in two places: on the main page and in the sidebar.
- Separate SVGs for light and dark themes.

Where is it configured:

- `_config.yml` -> `nlo.github_chart`.
- Keys:
  - `home_image`
  - `home_image_dark`
  - `sidebar_image`
  - `sidebar_image_dark`

How it updates automatically:

- Workflow: `.github/workflows/update-githubchart.yml`
- Scheduled launch: `0 3 * * *` (daily) and manually after `workflow_dispatch`.
- Generation: `tools/generate-githubchart.sh`
- When changes are made, the following files are committed:
  - `assets/img/githubchart.svg`
  - `assets/img/githubchart-sidebar.svg`
  - `assets/img/githubchart-dark.svg`
  - `assets/img/githubchart-sidebar-dark.svg`

## 2) Local admin panel (for development only)

What is it based on:

- Basic editing functionality: gem `jekyll-admin`.
- The UI will be forked inside the repository into the `admin/` folder for customization for NLO.

How does this work:

- Plugin `_plugins/jekyll-admin-fork.rb` mounts:
  - `/admin` -> local UI from `admin/`
  - `/_api` -> API from `JekyllAdmin::Server`
- Custom interface files:
  - `admin/index.html`
  - `admin/nlo-admin.css`
  - `admin/nlo-admin.js`

Local launch:

```bash
bash tools/run.sh --admin
```

URL:

```text
http://127.0.0.1:4000/admin
```

Why not in production:

- The admin function is intended for the local development circuit.
- The gem `jekyll-admin` is connected as a development dependency (`Gemfile`, group `:development`).
- A public production site should remain only a content layer without an open editor/API loop.

## 3) Sidebar and editor UX improvements

What's added:

- `sidebar` added a prominent `ADMIN` button in the bottom navigation block (only shown in `development`).
- The avatar block in the sidebar has been increased by ~30% for better visual balance.
- For the avatar, separate sources are used for light and dark themes:
  - `nlo.branding.avatar_light`
  - `nlo.branding.avatar_dark`
- The avatar frame setting is included in the config (`nlo.branding.avatar_frame`) and supports styles:
  - `round`
  - `discord`
- In a dark theme, the avatar frame is darkened to match the overall tone of the interface.

What has been changed in the admin panel:

- The settings `GitHub Chart Palette` and `Avatar Frame` are built into the `Configuration` page as normal items.
- Both settings blocks are displayed in one line on the desktop (two columns), and on narrow screens they are folded into one column.
- A tooltip explanation has been added for the `author` field:
  - if you specify a key from `_data/authors.yml`, the author is displayed as a link to the profile;
  - if the key is not found, the value `author` is displayed as plain text.

## 4) Multilingual and language switch

What's added:

- `lang` in `_config.yml` now supports multiple languages ​​separated by commas:
  - example: `lang: en, ru-RU, fr-FR`
- If one language is specified, the language selector is not displayed.
- If multiple languages ​​are specified:
  - up to 3 languages ​​flags are displayed;
  - if the quantity is larger, the compact `select` is automatically displayed.
- The selector signature is localized (`Site version`) via locale files.
- Flags are stored locally in `assets/img/flags/`.
- In `title` flags show the human-readable name of the language (rather than technical code like `ru-RU`).

Technically:

- Language normalization and active language selection are included in `_includes/lang.html`.
- The selector UI is implemented in `_includes/lang-switch.html` and is built as the first item in the sidebar navigation (visually as `HOME`).
- Added soft transparency (`opacity: 0.7`) and active language highlighting (hover/active -> `opacity: 1`) to flags.

## 5) Language URLs and content visibility

What's changed in the URL:

- Language switching now uses short prefixes:
  - `http://127.0.0.1:4000/ru/`
  - `http://127.0.0.1:4000/fr/`
- For localized home pages, short permalinks are specified:
  - `ru-RU/index.md` -> `/ru/`
  - `fr-FR/index.md` -> `/fr/`
- The language detector in `_includes/lang.html` now understands both the full locale code and the short prefix alias.

What's changed in the content:

- Added `language` in front matter to posts (for example `language: en`, `language: ru-RU`).
- Posts are shown only for the current interface language.
- Posts without `language`/`lang` are considered `default_lang` content (backwards compatible).

Where filtering works:

- Home (`home`)
- Archives (`archives`)
- Lists of categories/tags (`categories`, `tags`)
- Pages of a specific category/tag
- Sidebar: latest updates and trending tags
- Related posts inside the article

## What's next

We will add the following differences to the same post as we implement them in order to maintain a transparent and verifiable list of changes.
