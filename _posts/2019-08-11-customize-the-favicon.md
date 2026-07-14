---
title: Customize the Favicon
language: en
translation_key: customize-the-favicon
author: GoXLd
date: '2019-08-11 00:34:00 +0800'
categories:
- Blogging
- Tutorial
tags:
- favicon
---

The [favicons](https://www.favicon-generator.org/about/) of [**Chirpy**](https://github.com/cotes2020/jekyll-theme-chirpy/) live in `assets/img/favicons/`{: .filepath}. Here's how to replace them with your own.

## Generate the favicon

Prepare a square image (PNG, JPG, or SVG) at least 512x512, open [**Real Favicon Generator**](https://realfavicongenerator.net/), and click <kbd>Pick your favicon image</kbd> to upload it.

The next page shows every usage scenario. Keep the defaults, scroll to the bottom, and click <kbd>Next →</kbd> to generate the favicon.

## Download & Replace

Download the package, unzip it, and delete:

- `site.webmanifest`{: .filepath}

Copy the remaining image files (`.PNG`{: .filepath}, `.ICO`{: .filepath}, `.SVG`{: .filepath}) over the originals in `assets/img/favicons/`{: .filepath}, creating that directory if it doesn't exist.

This table summarizes what changes:

| File(s) | From Online Tool | From Chirpy |
| ------- | :--------------: | :---------: |
| `*.PNG` |        ✓         |      ✗      |
| `*.ICO` |        ✓         |      ✗      |
| `*.SVG` |        ✓         |      ✗      |


<!-- markdownlint-disable-next-line -->
>  ✓ means keep, ✗ means delete.
{: .prompt-info }

The next build will use your customized favicon.
