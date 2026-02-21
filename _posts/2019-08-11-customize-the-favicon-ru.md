---
title: Настройка favicon
language: ru-RU
translation_key: customize-the-favicon
author: GoXLd
date: 2019-08-11 00:34:00 +0800
categories:
- Blogging
- Tutorial
tags:
- favicon
---

Файлы [favicons](https://www.favicon-generator.org/about/) из [**Chirpy**](https://github.com/cotes2020/jekyll-theme-chirpy/) располагаются в каталоге `assets/img/favicons/`{: .filepath}. Возможно, вы сможете заменить их своими силами. Следующие разделы помогут вам создать и заменить значки по умолчанию.

## Генерация favicon

Подготовьте квадратное изображение (PNG, JPG или SVG) размером 512x512 или более, затем перейдите в [**Real Favicon Generator**](https://realfavicongenerator.net/) и нажмите <kbd>Pick your favicon image</kbd>, чтобы загрузить файл изображения.

На следующем шаге на веб-странице будут показаны все сценарии использования. Вы можете сохранить параметры по умолчанию, прокрутить страницу вниз и нажать кнопку <kbd>Далее →</kbd>, чтобы создать значок.

## Скачать и заменить

Загрузите сгенерированный пакет, разархивируйте и удалите из извлеченных файлов следующие файлы:

- `site.webmanifest`{: .filepath}

А затем скопируйте содержимое файлов изображений (`.PNG`{: .filepath}, `.ICO`{: .filepath} и ​​`.SVG`{: .filepath}), чтобы закрыть файлы в каталоге `assets/img/favicons/`{: .filepath} вашего сайта Jekyll. Если на вашем сайте Jekyll еще нет этого каталога, просто создайте его.

Следующая таблица поможет вам понять изменения в файлах значков:

| Файл(ы) | Из онлайн-инструмента | От Чирпи |
| ------- | :--------------: | :---------: |
| `*.PNG` | None | None |
| `*.ICO` | None | None |
| `*.SVG` | None | None |


<!-- markdownlint-disable-next-line -->
>  ✓ означает сохранить, ✗ означает удалить.
{: .prompt-info }

В следующий раз, когда вы создадите сайт, значок будет заменен на настроенную версию.
