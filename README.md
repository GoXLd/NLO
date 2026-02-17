# NLO Jekyll Theme

`NLO` is a standalone Jekyll theme for GitHub Pages, based on the original
[`jekyll-theme-chirpy`](https://github.com/cotes2020/jekyll-theme-chirpy) codebase.

This repository is intended for active customization and long-term maintenance
without developing directly in production blog repositories.

## What is already done

- The full theme source was initialized in this repository.
- Theme package name was switched to `jekyll-theme-nlo`.
- Existing production customizations were ported as theme features:
  - GitHub contribution chart blocks on home and sidebar
  - optional branding logo injection in sidebar title
  - optional per-post AdSense script injection
- All custom features are configurable via `site.nlo` in `_config.yml`.

## Configuration

Main theme configuration lives in `_config.yml`.

Custom NLO block:

```yml
nlo:
  github_chart:
    enabled: false
    home_image: /assets/img/githubchart.svg
    sidebar_image: /assets/img/githubchart-sidebar.svg
  branding:
    logo_src:
    logo_alt:
    logo_aria_label:
  adsense:
    client:
```

## Local Visual Editor

`NLO` includes local browser editing via `jekyll-admin`.

Install dependencies:

```bash
bundle install
```

Run site with editor:

```bash
bash tools/run.sh --admin
```

Admin API URL:

```text
http://127.0.0.1:4000/admin
```

`/admin` uses a local fork from `admin/` in this repository, so UI/UX can be customized without editing the upstream gem.

Fork entry points:

- `admin/index.html`
- `admin/nlo-admin.css`
- `admin/nlo-admin.js`
- `_plugins/jekyll-admin-fork.rb` (mounts local fork at `/admin`)

## Migration

Use the checklist in [`MIGRATION_CHECKLIST.md`](MIGRATION_CHECKLIST.md).

## License

This project remains under the MIT license.
See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md).
