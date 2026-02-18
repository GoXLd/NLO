---
title: 'NLO vs Chirpy: Diff Log'
description: Объективный список отличий темы NLO от оригинального jekyll-theme-chirpy.
  Пост обновляется по мере миграции и развития темы.
date: '2026-02-17 12:30:00 +0100'
categories:
- NLO
- Migration
tags:
- nlo
- chirpy
- changelog
---

![](assets/img/logo_nlo.png)
Этот пост фиксирует **конкретные технические отличия** от оригинальной темы.
Формат простой: добавляем пункт, когда он реализован и проверен.

## Чеклист различий

- [x] Личная статистика GitHub contribution graph (home + sidebar) с автообновлением через workflow
- [x] Локальная админка для редактирования контента, основанная на `jekyll-admin`, с форком UI внутри проекта
- [x] Быстрый вход в локальную админку через отдельную кнопку в sidebar (только dev)
- [x] Расширенное брендирование sidebar: разные аватары для light/dark + выбор стиля рамки

## 1) Личная статистика контрибутов GitHub

Что добавлено:

- Отображение GitHub contribution chart в двух местах: на главной странице и в sidebar.
- Отдельные SVG для светлой и темной темы.

Где настраивается:

- `_config.yml` -> `nlo.github_chart`.
- Ключи:
  - `home_image`
  - `home_image_dark`
  - `sidebar_image`
  - `sidebar_image_dark`

Как обновляется автоматически:

- Workflow: `.github/workflows/update-githubchart.yml`
- Запуск по расписанию: `0 3 * * *` (ежедневно) и вручную через `workflow_dispatch`.
- Генерация: `tools/generate-githubchart.sh`
- При изменениях коммитятся файлы:
  - `assets/img/githubchart.svg`
  - `assets/img/githubchart-sidebar.svg`
  - `assets/img/githubchart-dark.svg`
  - `assets/img/githubchart-sidebar-dark.svg`

## 2) Локальная админка (только для разработки)

На чем основано:

- Базовый функционал редактирования: гем `jekyll-admin`.
- UI форкнут внутрь репозитория в папку `admin/` для кастомизации под NLO.

Как это работает:

- Плагин `_plugins/jekyll-admin-fork.rb` монтирует:
  - `/admin` -> локальный UI из `admin/`
  - `/_api` -> API от `JekyllAdmin::Server`
- Файлы кастомного интерфейса:
  - `admin/index.html`
  - `admin/nlo-admin.css`
  - `admin/nlo-admin.js`

Локальный запуск:

```bash
bash tools/run.sh --admin
```

URL:

```text
http://127.0.0.1:4000/admin
```

Почему не в проде:

- Функция админки предназначена для локального контура разработки.
- Гем `jekyll-admin` подключен как development dependency (`Gemfile`, группа `:development`).
- Публичный production-сайт должен оставаться только контентным слоем без открытого editor/API контура.

## 3) Sidebar и UX-улучшения редактора

Что добавлено:

- В `sidebar` добавлена заметная кнопка `ADMIN` в нижнем блоке навигации (показывается только в `development`).
- Блок аватара в sidebar увеличен на ~30% для лучшего визуального баланса.
- Для аватара используются отдельные источники под светлую и тёмную темы:
  - `nlo.branding.avatar_light`
  - `nlo.branding.avatar_dark`
- Настройка рамки аватара вынесена в конфиг (`nlo.branding.avatar_frame`) и поддерживает стили:
  - `round`
  - `discord`
- В тёмной теме рамка аватара затемнена под общий тон интерфейса.

Что изменено в админке:

- Настройки `GitHub Chart Palette` и `Avatar Frame` встроены в страницу `Configuration` как обычные пункты.
- Оба блока настроек отображаются в одну строку на десктопе (две колонки), а на узких экранах складываются в одну колонку.

## Что дальше

Следующие отличия будем добавлять в этот же пост по мере реализации, чтобы сохранять прозрачный и проверяемый список изменений.
