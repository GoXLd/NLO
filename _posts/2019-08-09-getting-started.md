---
title: Getting Started
language: en
translation_key: getting-started
description: >-
  Install, configure, and deploy your first Chirpy-based website.
author: cotes
date: 2019-08-09 20:55:00 +0800
categories: [Blogging, Tutorial]
tags: [getting started]
pin: true
media_subpath: '/posts/20180809'
---

## Creating a Site Repository

You have two options:

### Option 1. Using the Starter (Recommended)

Simplifies upgrades, isolates unnecessary files, and lets you focus on writing with minimal configuration.

1. Sign in to GitHub and go to the [**starter**][starter].
2. Click <kbd>Use this template</kbd> > <kbd>Create a new repository</kbd>.
3. Name the repository `<username>.github.io`, replacing `username` with your lowercase GitHub username.

### Option 2. Forking the Theme

Convenient for modifying features or UI, but harder to upgrade. Only choose this if you know Jekyll and plan to heavily modify the theme.

1. Sign in to GitHub.
2. [Fork the theme repository](https://github.com/cotes2020/jekyll-theme-chirpy/fork).
3. Name the repository `<username>.github.io`, replacing `username` with your lowercase GitHub username.

## Setting up the Environment

With the repository created, set up your development environment one of two ways:

### Using Dev Containers (Recommended for Windows)

Dev Containers give you an isolated Docker environment that avoids system conflicts and manages all dependencies inside the container.

**Steps**:

1. Install Docker:
   - Windows/macOS: [Docker Desktop][docker-desktop].
   - Linux: [Docker Engine][docker-engine].
2. Install [VS Code][vscode] and the [Dev Containers extension][dev-containers].
3. Clone your repository:
   - Docker Desktop: start VS Code and [clone your repo in a container volume][dc-clone-in-vol].
   - Docker Engine: clone your repo locally, then [open it in a container][dc-open-in-container] via VS Code.
4. Wait for the setup to complete.

### Setting up Natively (Recommended for Unix-like OS)

On Unix-like systems, a native setup gives the best performance; Dev Containers also work.

**Steps**:

1. Follow the [Jekyll installation guide](https://jekyllrb.com/docs/installation/) and make sure [Git](https://git-scm.com/) is installed.
2. Clone your repository locally.
3. If you forked the theme, install [Node.js][nodejs] and run `bash tools/init.sh` in the root to initialize the repository.
4. Run `bundle` in the repository root to install dependencies.

## Usage

### Start the Jekyll Server

Run the site locally:

```terminal
$ bundle exec jekyll serve
```

> With Dev Containers, run this in the **VS Code** Terminal.
{: .prompt-info }

After a few seconds the site is available at <http://127.0.0.1:4000>.

### Configuration

Update `_config.yml`{: .filepath} as needed. Common options:

- `url`
- `avatar`
- `timezone`
- `lang`

### Social Contact Options

Social contacts appear at the bottom of the sidebar. Enable or disable them in `_data/contact.yml`{: .filepath}.

### Customizing the Stylesheet

Copy the theme's `assets/css/jekyll-theme-chirpy.scss`{: .filepath} to the same path in your site, then append your custom styles.

### Customizing Static Assets

Static assets configuration arrived in `5.1.0`. Their CDN is defined in `_data/origin/cors.yml`{: .filepath }; replace entries to suit the network conditions where your site is published.

To self-host the static assets, see the [_chirpy-static-assets_](https://github.com/cotes2020/chirpy-static-assets#readme) repository.

## Deployment

Before deploying, check `_config.yml`{: .filepath} and set `url` correctly. For a [**project site**](https://help.github.com/en/github/working-with-github-pages/about-github-pages#types-of-github-pages-sites) without a custom domain, or to serve under a base URL on a non-**GitHub Pages** server, set `baseurl` to your project name with a leading slash, e.g. `/project-name`.

Now choose _one_ of the following methods.

### Deploy Using Github Actions

Prepare the following:

- On the GitHub Free plan, keep the site repository public.
- If you committed `Gemfile.lock`{: .filepath} and your machine isn't Linux, add the Linux platform:

  ```console
  $ bundle lock --add-platform x86_64-linux
  ```

Then configure _Pages_:

1. On GitHub, open _Settings_ > _Pages_. Under _Build and deployment_ > **Source**, select [**GitHub Actions**][pages-workflow-src].  
   ![Build source](pages-source-light.png){: .light .border .normal w='375' h='140' }
   ![Build source](pages-source-dark.png){: .dark .normal w='375' h='140' }

2. Push a commit to trigger the workflow. In the _Actions_ tab, watch _Build and Deploy_ run; on success the site deploys automatically.

Visit the URL GitHub provides to see your site.

### Manual Build and Deployment

For self-hosted servers, build locally and upload the output.

From the project root, build the site:

```console
$ JEKYLL_ENV=production bundle exec jekyll b
```

Unless you set another output path, the files land in `_site`{: .filepath}. Upload them to your server.

[nodejs]: https://nodejs.org/
[starter]: https://github.com/cotes2020/chirpy-starter
[pages-workflow-src]: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow
[docker-desktop]: https://www.docker.com/products/docker-desktop/
[docker-engine]: https://docs.docker.com/engine/install/
[vscode]: https://code.visualstudio.com/
[dev-containers]: https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers
[dc-clone-in-vol]: https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-a-git-repository-or-github-pr-in-an-isolated-container-volume
[dc-open-in-container]: https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container
