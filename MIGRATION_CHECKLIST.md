# Migration Checklist: `goxld.github.io` -> `NLO`

## 1. Prepare `NLO` repository

- [ ] Push current `NLO` branch with initialized theme code.
- [ ] Confirm `LICENSE` and `NOTICE.md` are present.
- [ ] Confirm theme builds locally (`bundle exec jekyll build`).

## 2. Freeze production blog changes

- [ ] In `goxld.github.io`, commit or stash all uncommitted content/theme edits.
- [ ] Create a backup tag/branch in `goxld.github.io` before migration.

## 3. Switch blog repo from Chirpy gem to local theme source

Choose one strategy:

### Strategy A (recommended): keep `NLO` as theme source and copy tracked theme files

- [ ] Copy from `NLO` to `goxld.github.io` the theme-controlled folders/files:
  - `_includes/`
  - `_layouts/`
  - `_sass/`
  - `assets/`
  - `_data/locales/`
  - `_data/origin/`
  - `_plugins/`
  - `index.html`
  - `_tabs/`
- [ ] In `goxld.github.io/_config.yml`, set:
  - `theme: jekyll-theme-nlo` if you publish a gem, or
  - remove `theme:` when using copied local source files only.

### Strategy B: package and consume as gem

- [ ] Build/publish `jekyll-theme-nlo` gem.
- [ ] In `goxld.github.io/Gemfile`, replace `jekyll-theme-chirpy` with `jekyll-theme-nlo`.
- [ ] Update `theme: jekyll-theme-nlo` in `goxld.github.io/_config.yml`.

## 4. Port site-specific values (do not hardcode in theme)

- [ ] Copy real site values in `goxld.github.io/_config.yml`:
  - `url`, `lang`, `timezone`, `social`, `analytics`, `comments`
- [ ] Configure NLO block:
  - `nlo.github_chart.enabled`
  - `nlo.branding.logo_src`
  - `nlo.adsense.client`
- [ ] Ensure `defaults` include `ads: false` for posts unless explicitly enabled.

## 5. Validate generated site

- [ ] Run `bundle install` in `goxld.github.io`.
- [ ] Run `bundle exec jekyll build`.
- [ ] Run local preview and verify:
  - [ ] Home page renders chart card correctly
  - [ ] Sidebar chart appears only when enabled and not on home layout
  - [ ] Sidebar logo replacement works when configured
  - [ ] AdSense script appears only on `post` pages with `ads: true`
  - [ ] Mobile layout remains stable

## 6. Update CI/CD

- [ ] Ensure GitHub Pages workflow still runs on `main`.
- [ ] If using assets submodule, ensure checkout includes submodules.
- [ ] Re-run deployment and check Pages output.

## 7. Cutover

- [ ] Merge migration branch to `main` in `goxld.github.io`.
- [ ] Monitor first production deploy for rendering regressions.
- [ ] Keep rollback branch/tag for fast recovery.
