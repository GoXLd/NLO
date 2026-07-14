---
title: Написание нового поста
language: ru-RU
translation_key: write-a-new-post
permalink: /posts/ru/write-a-new-post/
author: cotes
date: 2019-08-08 14:10:00 +0800
categories:
- Blogging
- Tutorial
tags:
- writing
render_with_liquid: false
---

Это руководство описывает, как написать пост в шаблоне _Chirpy_. Его стоит прочитать, даже если вы знаете Jekyll, так как многие возможности зависят от определённых переменных.

## Написание с помощью dumalog

![dumalog](/assets/img/dumalog-black.svg){: .light w="240" }
![dumalog](/assets/img/dumalog-white.svg){: .dark w="240" }

Не хотите возиться с шаблоном? [**dumalog**](https://github.com/GoXLd/dumalog) — это ИИ-агент, который превращает ваши рабочие переписки (Claude Code, Codex CLI) в готовые к публикации посты Jekyll. Он хранит историю чатов локально в индексе [memPalace](https://github.com/MemPalace/mempalace) и создаёт черновики с правильным фронт-маттером — включая поля `language` / `translation_key` темы NLO, — так что черновик сразу готов к публикации.

```bash
curl -fsSL https://raw.githubusercontent.com/GoXLd/dumalog/main/install.sh | bash
dumalog setup            # найти блог и изучить его стиль
dumalog write "тема"     # создать черновик (без темы — предложит варианты)
```

Всё работает локально; модели отправляется только анонимизированный контекст, нужный для черновика. Остальная часть руководства описывает фронт-маттер и Markdown, которые dumalog заполняет за вас, — полезно, когда черновик нужно доработать вручную.

## Именование и путь

Создайте файл с именем `YYYY-MM-DD-TITLE.EXTENSION`{: .filepath} в `_posts`{: .filepath} корневого каталога. `EXTENSION`{: .filepath} должен быть `md`{: .filepath} или `markdown`{: .filepath}. Чтобы сэкономить время, создавать файлы может плагин [`Jekyll-Compose`](https://github.com/jekyll/jekyll-compose).

## Фронт-маттер

Заполните [Front Matter](https://jekyllrb.com/docs/front-matter/) в начале поста:

```yaml
---
title: TITLE
date: YYYY-MM-DD HH:MM:SS +/-TTTT
categories: [TOP_CATEGORY, SUB_CATEGORY]
tags: [TAG]     # TAG names should always be lowercase
---
```

> По умолчанию для постов установлен layout `post`, поэтому добавлять переменную _layout_ в Front Matter не нужно.
{: .prompt-tip }

### Часовой пояс даты

Чтобы корректно указать дату публикации, задайте `timezone` в `_config.yml`{: .filepath} и укажите смещение часового пояса в `date` фронт-маттера. Формат: `+/-TTTT`, например `+0800`.

### Категории и теги

Пост принимает до двух `categories` и любое количество `tags`. Например:

```yaml
---
categories: [Animal, Insect]
tags: [bee]
---
```

### Информация об авторе

Информацию об авторе обычно не нужно задавать в _Front Matter_: по умолчанию она берётся из `social.name` и первой записи `social.links` в конфигурации. Чтобы переопределить её, добавьте автора в `_data/authors.yml` (создайте файл, если его нет):

```yaml
<author_id>:
  name: <full name>
  twitter: <twitter_of_author>
  url: <homepage_of_author>
```
{: file="_data/authors.yml" }

Затем укажите одну запись через `author` или несколько через `authors`:

```yaml
---
author: <author_id>                     # for single entry
# or
authors: [<author1_id>, <author2_id>]   # for multiple entries
---
```

Ключ `author` тоже может содержать несколько записей.

> Преимущество чтения автора из `_data/authors.yml`{: .filepath } в том, что у страницы появляется метатег `twitter:creator`, который обогащает [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started#card-and-content-attribution) и полезен для SEO.
{: .prompt-info }

### Описание поста

По умолчанию первые слова поста показываются в списке на главной, в блоке _Further Reading_ и в RSS. Чтобы заменить этот автоматический фрагмент, задайте поле `description` в _Front Matter_:

```yaml
---
description: Short summary of the post.
---
```

Текст `description` также отображается под заголовком на странице поста.

## Оглавление

По умолчанию оглавление (TOC) показывается в правой панели. Чтобы отключить его глобально, задайте `toc: false` в `_config.yml`{: .filepath}. Чтобы отключить для одного поста, добавьте в его [Front Matter](https://jekyllrb.com/docs/front-matter/):

```yaml
---
toc: false
---
```

## Комментарии

Комментарии задаются глобально опцией `comments.provider` в `_config.yml`{: .filepath}. Как только выбран провайдер, комментарии включаются для всех постов.

Чтобы отключить комментарии для одного поста, добавьте в его **Front Matter**:

```yaml
---
comments: false
---
```

## Медиа

Изображения, аудио и видео — это медиаресурсы в _Chirpy_.

### Префикс URL-адреса
{: #url-prefix }

Чтобы не повторять один и тот же префикс URL для нескольких ресурсов поста, задайте один из двух параметров.

- Если медиафайлы размещены в CDN, укажите `cdn` в `_config.yml`{: .filepath }. URL-адреса для аватара сайта и постов будут начинаться с домена CDN.

  ```yaml
  cdn: https://cdn.com
  ```
  {: file='_config.yml' .nolineno }

- Чтобы задать префикс пути для текущего поста/страницы, используйте `media_subpath` в его _Front Matter_:

  ```yaml
  ---
  media_subpath: /path/to/media/
  ---
  ```
  {: .nolineno }

`site.cdn` и `page.media_subpath` вместе формируют итоговый URL: `[site.cdn/][page.media_subpath/]file.ext`

### Изображения

#### Подпись

Сделайте строку сразу после изображения курсивом, и она станет подписью под ним:

```markdown
![img-description](/path/to/image)
_Image Caption_
```
{: .nolineno}

#### Размер

Задайте ширину и высоту каждого изображения, чтобы макет не смещался при загрузке.

```markdown
![Desktop View](/assets/img/sample/mockup.png){: width="700" height="400" }
```
{: .nolineno}

> Для SVG нужно указать хотя бы _ширину_, иначе он не отобразится.
{: .prompt-info }

Начиная с _Chirpy v5.0.0_, `height` и `width` можно сокращать (`h`, `w`). Это эквивалентно примеру выше:

```markdown
![Desktop View](/assets/img/sample/mockup.png){: w="700" h="400" }
```
{: .nolineno}

#### Позиция

Изображения центрируются по умолчанию; используйте класс `normal`, `left` или `right`, чтобы задать положение.

> После указания позиции подпись к изображению добавлять не следует.
{: .prompt-warning }

- **Нормальное положение**

  Изображение будет выровнено по левому краю:

  ```markdown
  ![Desktop View](/assets/img/sample/mockup.png){: .normal }
  ```
  {: .nolineno}

- **Плавать влево**

  ```markdown
  ![Desktop View](/assets/img/sample/mockup.png){: .left }
  ```
  {: .nolineno}

- **Плавать вправо**

  ```markdown
  ![Desktop View](/assets/img/sample/mockup.png){: .right }
  ```
  {: .nolineno}

#### Тёмный/светлый режим

Изображения могут следовать теме. Подготовьте два изображения и назначьте каждому класс `dark` или `light`:

```markdown
![Light mode only](/path/to/light-mode.png){: .light }
![Dark mode only](/path/to/dark-mode.png){: .dark }
```

#### Тень

Скриншоты окон программ можно показать с эффектом тени:

```markdown
![Desktop View](/assets/img/sample/mockup.png){: .shadow }
```
{: .nolineno}

#### Изображение для предпросмотра

Для изображения вверху поста используйте разрешение `1200 x 630`. Если соотношение сторон не `1.91 : 1`, изображение будет масштабировано и обрезано.

Затем задайте атрибуты изображения:

```yaml
---
image:
  path: /path/to/image
  alt: image alternative text
---
```

[`media_subpath`](#url-prefix) применяется и к изображению предпросмотра, поэтому, если он задан, в `path` достаточно указать имя файла.

Для простых случаев путь можно задать одним `image`:

```yml
---
image: /path/to/image
---
```

#### LQIP

Для изображений предпросмотра:

```yaml
---
image:
  lqip: /path/to/lqip-file # or base64 URI
---
```

> LQIP можно увидеть на превью поста «[Text and Typography](../text-and-typography/)».

Для обычных изображений:

```markdown
![Image description](/path/to/image){: lqip="/path/to/lqip-file" }
```
{: .nolineno }

### Платформы социальных сетей

Вставляйте видео/аудио с социальных платформ так:

```liquid
{% include embed/{Platform}.html id='{ID}' %}
```

`Platform` — название платформы строчными буквами, `ID` — идентификатор видео.

Таблица показывает, как получить оба параметра из URL и какие платформы поддерживаются.

| URL-адрес видео | Платформа | ID |
| -------------------------------------------------------------------------------------------------------------------------- | ---------- | :----------------------- |
| [https://www.**youtube**.com/watch?v=**H-B46URT4mg**](https://www.youtube.com/watch?v=H-B46URT4mg) | `youtube` | `H-B46URT4mg` |
| [https://www.**twitch**.tv/videos/**1634779211**](https://www.twitch.tv/videos/1634779211) | `twitch` | `1634779211` |
| [https://www.**bilibili**.com/video/**BV1Q44y1B7Wf**](https://www.bilibili.com/video/BV1Q44y1B7Wf) | `bilibili` | `BV1Q44y1B7Wf` |
| [https://www.open.**spotify**.com/track/**3OuMIIFP5TxM8tLXMWYPGV**](https://open.spotify.com/track/3OuMIIFP5TxM8tLXMWYPGV) | `spotify` | `3OuMIIFP5TxM8tLXMWYPGV` |

Spotify поддерживает дополнительные параметры:

- `compact` — компактный плеер (напр. `{% include embed/spotify.html id='3OuMIIFP5TxM8tLXMWYPGV' compact=1 %}`);
- `dark` — принудительно тёмная тема (напр. `{% include embed/spotify.html id='3OuMIIFP5TxM8tLXMWYPGV' dark=1 %}`).

### Видеофайлы

Чтобы встроить видеофайл напрямую:

```liquid
{% include embed/video.html src='{URL}' %}
```

`URL` указывает на видеофайл, например `/path/to/sample/video.mp4`.

Встроенное видео также принимает атрибуты:

- `poster='/path/to/poster.png'` — постер, показываемый во время загрузки видео;
- `title='Text'` — заголовок под видео, как у изображений;
- `autoplay=true` — видео начинает воспроизводиться, как только сможет;
- `loop=true` — возврат к началу по достижении конца;
- `muted=true` — звук изначально отключён;
- `types` — расширения дополнительных видеоформатов через `|`. Эти файлы должны лежать в том же каталоге, что и основной.

Пример со всеми атрибутами:

```liquid
{%
  include embed/video.html
  src='/path/to/video.mp4'
  types='ogg|mov'
  poster='poster.png'
  title='Demo video'
  autoplay=true
  loop=true
  muted=true
%}
```

### Аудиофайлы

Чтобы встроить аудиофайл напрямую:

```liquid
{% include embed/audio.html src='{URL}' %}
```

`URL` указывает на аудиофайл, например `/path/to/audio.mp3`.

Встроенное аудио также принимает атрибуты:

- `title='Text'` — заголовок под аудио, как у изображений;
- `types` — расширения дополнительных аудиоформатов через `|`. Эти файлы должны лежать в том же каталоге, что и основной.

Пример со всеми атрибутами:

```liquid
{%
  include embed/audio.html
  src='/path/to/audio.mp3'
  types='ogg|wav|aac'
  title='Demo audio'
%}
```

## Закреплённые посты

Закрепите один или несколько постов вверху главной страницы (закреплённые сортируются по дате выпуска, от новых к старым). Включите так:

```yaml
---
pin: true
---
```

## Подсказки

Подсказки бывают четырёх типов: `tip`, `info`, `warning` и `danger`. Добавьте класс `prompt-{type}` к цитате. Например, подсказка `info`:

```md
> Example line for prompt.
{: .prompt-info }
```
{: .nolineno }

## Синтаксис

### Встроенный код

```md
`inline code part`
```
{: .nolineno }

### Выделение пути к файлу

```md
`/path/to/a/file.extend`{: .filepath}
```
{: .nolineno }

### Блок кода

Создайте блок кода с помощью ```` ``` ````:

````md
```
Это фрагмент кода в виде открытого текста.
```
````

#### Указание языка

Используйте ```` ```{language} ```` для подсветки синтаксиса:

````markdown
```yaml
key: value
```
````

> Тег Jekyll `{% highlight %}` несовместим с этой темой.
{: .prompt-danger }

#### Номер строки

Все языки, кроме `plaintext`, `console` и `terminal`, по умолчанию показывают номера строк. Чтобы их скрыть, добавьте класс `nolineno`:

````markdown
```shell
echo 'Больше никаких номеров строк!'
```
{: .nolineno }
````

#### Указание имени файла

Язык кода показывается вверху блока. Чтобы заменить его именем файла, добавьте атрибут `file`:

````markdown
```shell
# содержание
```
{: file="path/to/file" }
````

#### Код Liquid

Чтобы показать фрагмент **Liquid**, оберните его в `{% raw %}` и `{% endraw %}`:

````markdown
{% raw %}
```liquid
{% if product.title contains 'Pack' %}
  В названии этого продукта содержится слово Pack.
{% endif %}
```
{% endraw %}
````

Или добавьте `render_with_liquid: false` (требуется Jekyll 4.0 или выше) в блок YAML поста.

## Математика

Математика отображается через [**MathJax**][mathjax]. Из соображений производительности она не загружается по умолчанию; включите её так:

[mathjax]: https://www.mathjax.org/

```yaml
---
math: true
---
```

После включения добавляйте уравнения с таким синтаксисом:

- **Блочная математика** добавляется через `$$ math $$` с **обязательными** пустыми строками до и после `$$`.
  - **Нумерация уравнений** — через `$$\begin{equation} math \end{equation}$$`;
  - **Ссылка на нумерацию** — через `\label{eq:label_name}` в блоке уравнения и `\eqref{eq:label_name}` в тексте (см. пример ниже).
- **Встроенная математика** (в строках) добавляется через `$$ math $$` без пустых строк до и после `$$`.
- **Встроенная математика** (в списках) добавляется через `\$$ math $$`.

```markdown
<!-- Block math, keep all blank lines -->

$$
LaTeX_math_expression
$$

<!-- Equation numbering, keep all blank lines  -->

$$
\begin{equation}
  LaTeX_math_expression
  \label{eq:label_name}
\end{equation}
$$

Can be referenced as \eqref{eq:label_name}.

<!-- Inline math in lines, NO blank lines -->

"Lorem ipsum dolor sit amet, $$ LaTeX_math_expression $$ consectetur adipiscing elit."

<!-- Inline math in lists, escape the first `$` -->

1. \$$ LaTeX_math_expression $$
2. \$$ LaTeX_math_expression $$
3. \$$ LaTeX_math_expression $$
```

> Начиная с `v7.0.0`, параметры конфигурации **MathJax** перенесены в файл `assets/js/data/mathjax.js`{: .filepath }, и вы можете менять их по необходимости, например добавляя [расширения][mathjax-exts].  
> Если вы собираете сайт через `chirpy-starter`, скопируйте этот файл из каталога установки гема (найдите его командой `bundle info --path jekyll-theme-chirpy`) в тот же каталог репозитория.
{: .prompt-tip }

[mathjax-exts]: https://docs.mathjax.org/en/latest/input/tex/extensions/index.html

## Mermaid

[**Mermaid**](https://github.com/mermaid-js/mermaid) — инструмент для создания диаграмм. Включите его для поста через блок YAML:

```yaml
---
mermaid: true
---
```

Затем оберните код графа в ```` ```mermaid ```` и ```` ``` ````, как любой другой язык.

## Узнать больше

Подробнее о постах Jekyll — в [Jekyll Docs: Posts](https://jekyllrb.com/docs/posts/).
