---
title: Настройка favicon
language: ru-RU
translation_key: customize-the-favicon
permalink: /posts/ru/customize-the-favicon/
author: GoXLd
date: 2019-08-11 00:34:00 +0800
categories:
- Blogging
- Tutorial
tags:
- favicon
---

Файлы [favicons](https://www.favicon-generator.org/about/) темы [**Chirpy**](https://github.com/cotes2020/jekyll-theme-chirpy/) лежат в `assets/img/favicons/`{: .filepath}. Вот как заменить их своими.

## Генерация favicon

Подготовьте квадратное изображение (PNG, JPG или SVG) размером не менее 512x512, откройте [**Real Favicon Generator**](https://realfavicongenerator.net/) и нажмите <kbd>Pick your favicon image</kbd>, чтобы загрузить его.

На следующей странице показаны все сценарии использования. Оставьте значения по умолчанию, прокрутите вниз и нажмите <kbd>Next →</kbd>, чтобы создать favicon.

## Скачать и заменить

Загрузите пакет, распакуйте и удалите:

- `site.webmanifest`{: .filepath}

Скопируйте оставшиеся изображения (`.PNG`{: .filepath}, `.ICO`{: .filepath}, `.SVG`{: .filepath}) поверх исходных в `assets/img/favicons/`{: .filepath}, создав этот каталог, если его нет.

Таблица показывает, что меняется:

| Файл(ы) | Из онлайн-инструмента | Из Chirpy |
| ------- | :--------------: | :---------: |
| `*.PNG` |        ✓         |      ✗      |
| `*.ICO` |        ✓         |      ✗      |
| `*.SVG` |        ✓         |      ✗      |


<!-- markdownlint-disable-next-line -->
>  ✓ — сохранить, ✗ — удалить.
{: .prompt-info }

Следующая сборка будет использовать ваш favicon.
