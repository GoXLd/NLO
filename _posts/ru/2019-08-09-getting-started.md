---
title: Быстрый старт
language: ru-RU
translation_key: getting-started
permalink: /posts/ru/getting-started/
description: >-
  Установите, настройте и разверните свой первый сайт на базе Chirpy.
author: cotes
date: 2019-08-09 20:55:00 +0800
categories:
- Blogging
- Tutorial
tags:
- getting started
pin: true
media_subpath: /posts/20180809
---

## Создание репозитория сайта

Есть два варианта:

### Вариант 1. Использование стартера (рекомендуется)

Упрощает обновления, изолирует ненужные файлы и позволяет сосредоточиться на написании с минимальной настройкой.

1. Войдите в GitHub и перейдите к [**starter**][starter].
2. Нажмите <kbd>Use this template</kbd> > <kbd>Create a new repository</kbd>.
3. Назовите репозиторий `<username>.github.io`, заменив `username` своим именем пользователя GitHub в нижнем регистре.

### Вариант 2. Форк темы

Удобно для изменения функций или интерфейса, но усложняет обновления. Выбирайте этот путь, только если знаете Jekyll и планируете сильно менять тему.

1. Войдите в GitHub.
2. [Сделайте форк репозитория темы](https://github.com/cotes2020/jekyll-theme-chirpy/fork).
3. Назовите репозиторий `<username>.github.io`, заменив `username` своим именем пользователя GitHub в нижнем регистре.

## Настройка среды

После создания репозитория настройте среду разработки одним из двух способов:

### Контейнеры разработки (рекомендуется для Windows)

Dev Containers дают изолированную среду на Docker, которая исключает конфликты с системой и держит все зависимости внутри контейнера.

**Шаги**:

1. Установите Docker:
   - Windows/macOS: [Docker Desktop][docker-desktop].
   - Linux: [Docker Engine][docker-engine].
2. Установите [VS Code][vscode] и [расширение Dev Containers][dev-containers].
3. Клонируйте репозиторий:
   - Docker Desktop: запустите VS Code и [клонируйте репозиторий в том контейнере][dc-clone-in-vol].
   - Docker Engine: клонируйте репозиторий локально, затем [откройте его в контейнере][dc-open-in-container] через VS Code.
4. Дождитесь завершения настройки.

### Собственная настройка (рекомендуется для Unix-подобных ОС)

На Unix-подобных системах нативная настройка даёт лучшую производительность; Dev Containers тоже подойдут.

**Шаги**:

1. Следуйте [руководству по установке Jekyll](https://jekyllrb.com/docs/installation/) и убедитесь, что [Git](https://git-scm.com/) установлен.
2. Клонируйте репозиторий локально.
3. Если вы форкнули тему, установите [Node.js][nodejs] и запустите `bash tools/init.sh` в корне для инициализации репозитория.
4. Запустите `bundle` в корне репозитория, чтобы установить зависимости.

## Использование

### Запуск сервера Jekyll

Запустите сайт локально:

```terminal
$ bundle exec jekyll serve
```

> В Dev Containers запускайте эту команду в терминале **VS Code**.
{: .prompt-info }

Через несколько секунд сайт будет доступен по адресу <http://127.0.0.1:4000>.

### Конфигурация

При необходимости обновите `_config.yml`{: .filepath}. Частые параметры:

- `url`
- `avatar`
- `timezone`
- `lang`

### Параметры социальных контактов

Социальные контакты отображаются внизу боковой панели. Включайте и отключайте их в `_data/contact.yml`{: .filepath}.

### Настройка таблицы стилей

Скопируйте файл темы `assets/css/jekyll-theme-chirpy.scss`{: .filepath} в тот же путь вашего сайта и добавьте свои стили в конец.

### Настройка статических ресурсов

Настройка статических ресурсов появилась в `5.1.0`. Их CDN задаётся в `_data/origin/cors.yml`{: .filepath }; замените записи под условия сети региона, где опубликован сайт.

Чтобы размещать статические ресурсы самостоятельно, см. репозиторий [_chirpy-static-assets_](https://github.com/cotes2020/chirpy-static-assets#readme).

## Развёртывание

Перед развёртыванием проверьте `_config.yml`{: .filepath} и правильно задайте `url`. Для [**project site**](https://help.github.com/en/github/working-with-github-pages/about-github-pages#types-of-github-pages-sites) без собственного домена или для работы под базовым URL на сервере, отличном от **GitHub Pages**, задайте `baseurl` равным имени проекта с ведущей косой чертой, например `/project-name`.

Теперь выберите _один_ из следующих методов.

### Развёртывание через GitHub Actions

Подготовьте следующее:

- На бесплатном плане GitHub держите репозиторий сайта публичным.
- Если вы зафиксировали `Gemfile.lock`{: .filepath}, а ваша ОС не Linux, добавьте платформу Linux:

  ```console
  $ bundle lock --add-platform x86_64-linux
  ```

Затем настройте _Pages_:

1. На GitHub откройте _Settings_ > _Pages_. В _Build and deployment_ > **Source** выберите [**GitHub Actions**][pages-workflow-src].  
   ![Build source](pages-source-light.png){: .light .border .normal w='375' h='140' }
   ![Build source](pages-source-dark.png){: .dark .normal w='375' h='140' }

2. Отправьте коммит, чтобы запустить рабочий процесс. На вкладке _Actions_ следите за _Build and Deploy_; при успехе сайт развернётся автоматически.

Откройте URL, предоставленный GitHub, чтобы увидеть сайт.

### Ручная сборка и развёртывание

Для собственных серверов соберите сайт локально и загрузите результат.

Из корня проекта соберите сайт:

```console
$ JEKYLL_ENV=production bundle exec jekyll b
```

Если вы не задали другой выходной путь, файлы окажутся в `_site`{: .filepath}. Загрузите их на сервер.

[nodejs]: https://nodejs.org/
[starter]: https://github.com/cotes2020/chirpy-starter
[pages-workflow-src]: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow
[docker-desktop]: https://www.docker.com/products/docker-desktop/
[docker-engine]: https://docs.docker.com/engine/install/
[vscode]: https://code.visualstudio.com/
[dev-containers]: https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers
[dc-clone-in-vol]: https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-a-git-repository-or-github-pr-in-an-isolated-container-volume
[dc-open-in-container]: https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container
