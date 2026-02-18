(() => {
  const MODE_KEY = 'mode';
  const GH_PALETTE_KEY = 'gh_palette';
  const DEFAULT_GH_PALETTE = 'default';
  const AVATAR_FRAME_DEFAULT = 'round';
  const avatarFrameOptions = {
    round: 'Round',
    discord: 'Discord',
    apple: 'Apple App'
  };
  const root = document.documentElement;
  const chartPalettes = {
    default: {
      label: 'Default',
      dark: ['#222730', '#2a313b', '#333c49', '#3e4959', '#4b5a6d']
    },
    'nlo-logo': {
      label: 'NLO Logo',
      dark: ['#23262a', '#223244', '#2c4a66', '#3a6488', '#b35a2a'],
      light: ['#e6e8eb', '#c9d9e7', '#8fb2cc', '#2c5472', '#c8632d']
    }
  };
  const legacyPaletteMap = {
    'slate-a': 'default',
    'slate-b': 'default'
  };
  const cyrillicMap = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya'
  };

  const snippets = {
    prompt_tip: '> Tip text\n{: .prompt-tip }\n\n',
    prompt_info: '> Info text\n{: .prompt-info }\n\n',
    prompt_warning: '> Warning text\n{: .prompt-warning }\n\n',
    prompt_danger: '> Danger text\n{: .prompt-danger }\n\n',
    table:
      '| Column A | Column B |\n' +
      '| :------- | -------: |\n' +
      '| Value 1  | Value 2  |\n\n',
    footnote: 'Text with footnote[^1].\n\n[^1]: Footnote text.\n\n',
    image_modes:
      '![light mode only](/posts/20190808/devtools-light.png){: .light .w-75 .shadow .rounded-10 w=\'1212\' h=\'668\' }\n' +
      '![dark mode only](/posts/20190808/devtools-dark.png){: .dark .w-75 .shadow .rounded-10 w=\'1212\' h=\'668\' }\n\n'
  };
  const snippetButtonKinds = {
    prompt_tip: 'is-tip',
    prompt_info: 'is-info',
    prompt_warning: 'is-warning',
    prompt_danger: 'is-danger'
  };
  let adminConfigCache = null;
  let adminConfigPromise = null;

  function trimTrailingSlash(value) {
    return String(value || '').replace(/\/+$/, '');
  }

  function normalizeBaseurl(baseurl) {
    const value = trimTrailingSlash(baseurl);
    if (!value) {
      return '';
    }

    return value.startsWith('/') ? value : `/${value}`;
  }

  function resolveSiteHref(config) {
    const baseurl = normalizeBaseurl(config?.baseurl);
    return baseurl ? `${baseurl}/` : '/';
  }

  function isPlainLeftClick(event) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  function withBaseurl(path, baseurl) {
    const source = String(path || '').trim();
    if (!source) {
      return '';
    }

    if (/^(https?:)?\/\//i.test(source) || source.startsWith('data:') || source.startsWith('blob:')) {
      return source;
    }

    if (!source.startsWith('/')) {
      return source;
    }

    const normalizedBaseurl = normalizeBaseurl(baseurl);
    if (!normalizedBaseurl || source.startsWith(`${normalizedBaseurl}/`)) {
      return source;
    }

    return `${normalizedBaseurl}${source}`;
  }

  async function fetchAdminConfig() {
    if (adminConfigCache) {
      return adminConfigCache;
    }

    if (adminConfigPromise) {
      return adminConfigPromise;
    }

    adminConfigPromise = fetch('/_api/configuration', {
      credentials: 'same-origin',
      cache: 'no-store'
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Configuration request failed (${response.status})`);
        }
        return response.json();
      })
      .then((payload) => {
        const config = payload?.content && typeof payload.content === 'object' ? payload.content : payload;
        if (!config || typeof config !== 'object') {
          throw new Error('Configuration payload is invalid');
        }

        adminConfigCache = config;
        return config;
      })
      .catch(() => null)
      .finally(() => {
        adminConfigPromise = null;
      });

    return adminConfigPromise;
  }

  function applySidebarBranding(config) {
    const logoLink = document.querySelector('.sidebar .logo');
    if (!logoLink || logoLink.dataset.nloBrandingApplied === '1') {
      return;
    }

    const siteHref = resolveSiteHref(config);
    const logoAlt =
      config?.nlo?.branding?.logo_alt || config?.social?.name || config?.title || 'Site logo';
    const logoAria = config?.nlo?.branding?.logo_aria_label || logoAlt;
    const logoSrc = withBaseurl(
      config?.nlo?.branding?.logo_src || '/assets/img/logo_nlo.png',
      config?.baseurl
    );

    logoLink.dataset.nloBrandingApplied = '1';
    logoLink.dataset.nloSiteHref = siteHref;
    logoLink.classList.add('nlo-admin-logo');
    logoLink.setAttribute('href', siteHref);
    logoLink.setAttribute('aria-label', logoAria);
    logoLink.setAttribute('title', logoAlt);

    if (logoLink.dataset.nloHomeClickBound !== '1') {
      logoLink.dataset.nloHomeClickBound = '1';
      logoLink.addEventListener(
        'click',
        (event) => {
          if (!isPlainLeftClick(event)) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          const href = logoLink.dataset.nloSiteHref || '/';
          window.location.assign(href);
        },
        true
      );
    }

    logoLink.querySelector('img.nlo-admin-logo-image')?.remove();
    logoLink.textContent = '';

    if (!logoSrc) {
      return;
    }

    const image = document.createElement('img');
    image.className = 'nlo-admin-logo-image';
    image.src = logoSrc;
    image.alt = logoAlt;
    image.loading = 'eager';
    image.decoding = 'async';
    logoLink.appendChild(image);
  }

  async function ensureSidebarBranding() {
    const config = await fetchAdminConfig();
    applySidebarBranding(config || {});
  }

  function normalizePaletteName(name) {
    const normalized = String(name || '').trim();
    return legacyPaletteMap[normalized] || normalized;
  }

  function normalizeAvatarFrame(style) {
    const normalized = String(style || '')
      .trim()
      .toLowerCase();
    return Object.prototype.hasOwnProperty.call(avatarFrameOptions, normalized)
      ? normalized
      : AVATAR_FRAME_DEFAULT;
  }

  function isConfigurationRoute() {
    const currentPath = (window.location.pathname || '').toLowerCase();
    const currentHash = (window.location.hash || '').toLowerCase();

    return (
      currentPath.includes('/configuration') ||
      currentHash.includes('configuration') ||
      currentHash.includes('/config')
    );
  }

  function systemMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function modeLabel(mode) {
    return mode === 'dark' ? 'Dark' : 'Light';
  }

  function currentMode() {
    const saved = sessionStorage.getItem(MODE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }

    const attr = root.getAttribute('data-mode');
    if (attr === 'dark' || attr === 'light') {
      return attr;
    }

    return systemMode();
  }

  function currentGhPalette() {
    const saved = normalizePaletteName(sessionStorage.getItem(GH_PALETTE_KEY));
    if (saved && chartPalettes[saved]) {
      return saved;
    }

    const attr = normalizePaletteName(root.getAttribute('data-gh-palette'));
    if (attr && chartPalettes[attr]) {
      return attr;
    }

    return DEFAULT_GH_PALETTE;
  }

  function applyMode(mode) {
    root.setAttribute('data-mode', mode);
    sessionStorage.setItem(MODE_KEY, mode);

    const toggle = document.getElementById('nlo-admin-theme-toggle');
    if (toggle) {
      toggle.textContent = `Theme: ${modeLabel(mode)}`;
      toggle.setAttribute('aria-label', `Switch theme. Current: ${modeLabel(mode)}`);
    }
  }

  function applyGhPalette(name) {
    const next = normalizePaletteName(name);
    const paletteName = chartPalettes[next] ? next : DEFAULT_GH_PALETTE;
    const palette = chartPalettes[paletteName];
    const darkColors = palette.dark || chartPalettes[DEFAULT_GH_PALETTE].dark;

    root.setAttribute('data-gh-palette', paletteName);
    sessionStorage.setItem(GH_PALETTE_KEY, paletteName);

    darkColors.forEach((color, level) => {
      root.style.setProperty(`--gh-${level}`, color);
    });

    const select = document.getElementById('nlo-admin-gh-palette-select');
    if (select && select.value !== paletteName) {
      select.value = paletteName;
    }

    const label = document.getElementById('nlo-admin-gh-palette-label');
    if (label) {
      label.textContent = `GitHub Chart Palette: ${palette.label}`;
    }
  }

  function flipMode() {
    const next = currentMode() === 'dark' ? 'light' : 'dark';
    applyMode(next);
  }

  function ensureThemeToggle() {
    if (document.getElementById('nlo-admin-theme-toggle')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'nlo-admin-theme-toggle';
    button.type = 'button';
    button.addEventListener('click', flipMode);
    document.body.appendChild(button);
    applyMode(currentMode());
  }

  function paletteEnvBlock() {
    const paletteName = currentGhPalette();
    const palette = chartPalettes[paletteName];
    if (!palette) {
      return '';
    }

    const dark = palette.dark || [];
    const light = palette.light || [];
    const lightLines =
      light.length === 5
        ? `\nGITHUBCHART_LIGHT_LEVEL0: "${light[0]}"\n` +
          `GITHUBCHART_LIGHT_LEVEL1: "${light[1]}"\n` +
          `GITHUBCHART_LIGHT_LEVEL2: "${light[2]}"\n` +
          `GITHUBCHART_LIGHT_LEVEL3: "${light[3]}"\n` +
          `GITHUBCHART_LIGHT_LEVEL4: "${light[4]}"`
        : '';

    return (
      `GITHUBCHART_DARK_PALETTE: "${paletteName}"\n` +
      `GITHUBCHART_DARK_LEVEL0: "${dark[0]}"\n` +
      `GITHUBCHART_DARK_LEVEL1: "${dark[1]}"\n` +
      `GITHUBCHART_DARK_LEVEL2: "${dark[2]}"\n` +
      `GITHUBCHART_DARK_LEVEL3: "${dark[3]}"\n` +
      `GITHUBCHART_DARK_LEVEL4: "${dark[4]}"` +
      lightLines
    );
  }

  function copyPaletteEnv(button) {
    const text = paletteEnvBlock();
    if (!text || !button) {
      return;
    }

    const done = () => {
      const prev = button.textContent;
      button.textContent = 'Copied';
      window.setTimeout(() => {
        button.textContent = prev;
      }, 1200);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {});
      return;
    }

    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      done();
    } catch {
      // ignore fallback copy failures
    } finally {
      area.remove();
    }
  }

  function palettePayload(name = currentGhPalette()) {
    const palette = chartPalettes[name];
    if (!palette) {
      return null;
    }

    return {
      palette: name,
      dark: Array.isArray(palette.dark) ? [...palette.dark] : [],
      light: Array.isArray(palette.light) ? [...palette.light] : []
    };
  }

  function setPaletteStatus(message, isError = false) {
    const status = document.getElementById('nlo-admin-gh-status');
    if (!status) {
      return;
    }

    status.textContent = message || '';
    status.dataset.state = isError ? 'error' : 'ok';
  }

  function setAvatarFrameStatus(message, isError = false) {
    const status = document.getElementById('nlo-admin-avatar-frame-status');
    if (!status) {
      return;
    }

    status.textContent = message || '';
    status.dataset.state = isError ? 'error' : 'ok';
  }

  async function applyPaletteToWorkflow(button) {
    if (!button) {
      return;
    }

    const payload = palettePayload();
    if (!payload) {
      setPaletteStatus('Palette payload is empty', true);
      return;
    }

    const previous = button.textContent;
    button.disabled = true;
    button.textContent = 'Applying...';
    setPaletteStatus('Updating workflow and rebuilding SVG...');

    try {
      const response = await fetch('/admin/_nlo/githubchart/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify(payload)
      });

      const data = await response
        .json()
        .catch(() => ({ ok: false, error: `Invalid server response (${response.status})` }));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      button.textContent = 'Applied';
      setPaletteStatus('Done: workflow updated, SVG charts rebuilt.');
      window.setTimeout(() => {
        button.textContent = previous;
      }, 1400);
    } catch (error) {
      button.textContent = 'Failed';
      setPaletteStatus(`Error: ${error.message}`, true);
      window.setTimeout(() => {
        button.textContent = previous;
      }, 2200);
    } finally {
      button.disabled = false;
    }
  }

  async function syncAvatarFrameSelect(select) {
    const config = await fetchAdminConfig();
    const value = normalizeAvatarFrame(config?.nlo?.branding?.avatar_frame);
    if (select && select.value !== value) {
      select.value = value;
    }
  }

  async function applyAvatarFrameToConfig(button, select) {
    if (!button || !select) {
      return;
    }

    const style = normalizeAvatarFrame(select.value);
    const previous = button.textContent;
    button.disabled = true;
    button.textContent = 'Applying...';
    setAvatarFrameStatus('Updating _config.yml...');

    try {
      const response = await fetch('/admin/_nlo/avatar-frame/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({ style })
      });

      const data = await response
        .json()
        .catch(() => ({ ok: false, error: `Invalid server response (${response.status})` }));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      adminConfigCache = adminConfigCache || {};
      adminConfigCache.nlo = adminConfigCache.nlo || {};
      adminConfigCache.nlo.branding = adminConfigCache.nlo.branding || {};
      adminConfigCache.nlo.branding.avatar_frame = style;

      button.textContent = 'Applied';
      setAvatarFrameStatus('Saved. Rebuild/refresh site preview to see new frame.');
      window.setTimeout(() => {
        button.textContent = previous;
      }, 1400);
    } catch (error) {
      button.textContent = 'Failed';
      setAvatarFrameStatus(`Error: ${error.message}`, true);
      window.setTimeout(() => {
        button.textContent = previous;
      }, 2200);
    } finally {
      button.disabled = false;
    }
  }

  function ensureGhPalettePicker() {
    const showOnConfiguration = isConfigurationRoute();
    const existingPicker = document.getElementById('nlo-admin-gh-palette-picker');

    if (!showOnConfiguration) {
      existingPicker?.remove();
      return;
    }

    if (existingPicker) {
      return;
    }

    const wrapper = document.createElement('section');
    wrapper.id = 'nlo-admin-gh-palette-picker';

    const header = document.createElement('div');
    header.className = 'nlo-admin-gh-head';

    const label = document.createElement('p');
    label.id = 'nlo-admin-gh-palette-label';
    label.className = 'nlo-admin-gh-label';
    header.appendChild(label);

    const help = document.createElement('button');
    help.type = 'button';
    help.className = 'nlo-admin-gh-help';
    help.textContent = '?';
    help.setAttribute(
      'data-tip',
      'Copy Env копирует переменные палитры.\n' +
        'Вставь их в .github/workflows/update-githubchart.yml\n' +
        'в блок env шага Generate charts.\n' +
        'Apply + Build делает это автоматически\n' +
        'и сразу локально пересобирает SVG.'
    );
    help.setAttribute('aria-label', 'How Copy Env works');
    header.appendChild(help);

    wrapper.appendChild(header);

    const controls = document.createElement('div');
    controls.className = 'nlo-admin-gh-controls';

    const select = document.createElement('select');
    select.id = 'nlo-admin-gh-palette-select';
    select.className = 'nlo-admin-gh-select';

    Object.entries(chartPalettes).forEach(([key, palette]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = palette.label;
      select.appendChild(option);
    });

    select.addEventListener('change', (event) => {
      applyGhPalette(event.target.value);
    });

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.id = 'nlo-admin-gh-copy-env';
    copy.textContent = 'Copy Env';
    copy.title = 'Copy variables for workflow env';
    copy.addEventListener('click', () => copyPaletteEnv(copy));

    const apply = document.createElement('button');
    apply.type = 'button';
    apply.id = 'nlo-admin-gh-apply';
    apply.textContent = 'Apply + Build';
    apply.title = 'Update workflow palette and regenerate chart SVG locally';
    apply.addEventListener('click', () => {
      applyPaletteToWorkflow(apply);
    });

    controls.appendChild(select);
    controls.appendChild(copy);
    controls.appendChild(apply);
    wrapper.appendChild(controls);

    const preview = document.createElement('div');
    preview.className = 'nlo-admin-gh-preview';
    for (let i = 0; i < 5; i += 1) {
      const swatch = document.createElement('span');
      swatch.className = 'nlo-admin-gh-swatch';
      swatch.dataset.level = String(i);
      preview.appendChild(swatch);
    }
    wrapper.appendChild(preview);

    const status = document.createElement('p');
    status.id = 'nlo-admin-gh-status';
    status.className = 'nlo-admin-gh-status';
    status.dataset.state = 'ok';
    status.textContent = 'Choose palette and click Apply + Build.';
    wrapper.appendChild(status);

    document.body.appendChild(wrapper);
    applyGhPalette(currentGhPalette());
  }

  function ensureAvatarFramePicker() {
    const showOnConfiguration = isConfigurationRoute();
    const existingPicker = document.getElementById('nlo-admin-avatar-frame-picker');

    if (!showOnConfiguration) {
      existingPicker?.remove();
      return;
    }

    if (existingPicker) {
      return;
    }

    const wrapper = document.createElement('section');
    wrapper.id = 'nlo-admin-avatar-frame-picker';

    const label = document.createElement('p');
    label.className = 'nlo-admin-avatar-frame-label';
    label.textContent = 'Avatar Frame';
    wrapper.appendChild(label);

    const controls = document.createElement('div');
    controls.className = 'nlo-admin-avatar-frame-controls';

    const select = document.createElement('select');
    select.id = 'nlo-admin-avatar-frame-select';
    select.className = 'nlo-admin-gh-select';

    Object.entries(avatarFrameOptions).forEach(([value, text]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.appendChild(option);
    });

    const apply = document.createElement('button');
    apply.type = 'button';
    apply.id = 'nlo-admin-avatar-frame-apply';
    apply.textContent = 'Apply';
    apply.title = 'Save avatar frame style to _config.yml';
    apply.addEventListener('click', () => {
      applyAvatarFrameToConfig(apply, select);
    });

    controls.appendChild(select);
    controls.appendChild(apply);
    wrapper.appendChild(controls);

    const status = document.createElement('p');
    status.id = 'nlo-admin-avatar-frame-status';
    status.className = 'nlo-admin-avatar-frame-status';
    status.dataset.state = 'ok';
    status.textContent = 'Choose frame style for sidebar avatar.';
    wrapper.appendChild(status);

    document.body.appendChild(wrapper);
    void syncAvatarFrameSelect(select);
  }

  function fieldScore(input, hints) {
    const content = [
      input.name || '',
      input.id || '',
      input.placeholder || '',
      input.getAttribute('aria-label') || ''
    ]
      .join(' ')
      .toLowerCase();

    return hints.some((hint) => content.includes(hint));
  }

  function findInputByLabel(labelText) {
    const labels = Array.from(document.querySelectorAll('label'));
    const match = labels.find((label) => label.textContent.trim().toLowerCase() === labelText);
    if (!match) {
      return null;
    }

    const targetId = match.getAttribute('for');
    if (targetId) {
      const byId = document.getElementById(targetId);
      if (byId && (byId.tagName === 'INPUT' || byId.tagName === 'TEXTAREA')) {
        return byId;
      }
    }

    let node = match.nextElementSibling;
    while (node) {
      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        return node;
      }
      const nested = node.querySelector?.('input,textarea');
      if (nested) {
        return nested;
      }
      node = node.nextElementSibling;
    }

    return null;
  }

  function locateTitleInput() {
    const candidates = Array.from(document.querySelectorAll('input,textarea'));
    const byMeta = candidates.find((input) => fieldScore(input, ['title']));
    if (byMeta) {
      return byMeta;
    }
    return findInputByLabel('title');
  }

  function locatePathInput() {
    const candidates = Array.from(document.querySelectorAll('input,textarea'));
    const byMeta = candidates.find((input) => fieldScore(input, ['path', 'filename', 'relative_path']));
    if (byMeta) {
      return byMeta;
    }
    return findInputByLabel('path');
  }

  function transliterate(str) {
    return Array.from(str || '')
      .map((char) => {
        const lower = char.toLowerCase();
        return Object.prototype.hasOwnProperty.call(cyrillicMap, lower) ? cyrillicMap[lower] : char;
      })
      .join('');
  }

  function slugifyTitle(value) {
    const transliterated = transliterate(String(value || ''));
    const slug = transliterated
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (slug) {
      return slug;
    }

    const date = new Date().toISOString().slice(0, 10);
    return `post-${date}`;
  }

  function isInvalidPath(pathValue) {
    const path = String(pathValue || '').trim();
    if (!path) {
      return true;
    }
    if (/^\.(md|markdown)$/i.test(path)) {
      return true;
    }
    if (/\/\.(md|markdown)$/i.test(path)) {
      return true;
    }
    if (/^\d{4}-\d{2}-\d{2}-\.(md|markdown)$/i.test(path)) {
      return true;
    }
    return false;
  }

  function rewritePath(pathValue, slug) {
    const path = String(pathValue || '').trim();
    const ext = /\.markdown$/i.test(path) ? 'markdown' : 'md';

    const dateMatch = path.match(/^(\d{4}-\d{2}-\d{2}-)\.(md|markdown)$/i);
    if (dateMatch) {
      return `${dateMatch[1]}${slug}.${dateMatch[2].toLowerCase()}`;
    }

    const dirMatch = path.match(/^(.*\/)\.(md|markdown)$/i);
    if (dirMatch) {
      return `${dirMatch[1]}${slug}.${dirMatch[2].toLowerCase()}`;
    }

    return `${slug}.${ext}`;
  }

  function ensurePathAutofill() {
    const titleInput = locateTitleInput();
    const pathInput = locatePathInput();

    if (!titleInput || !pathInput || pathInput.dataset.nloPathAutofill === '1') {
      return;
    }

    pathInput.dataset.nloPathAutofill = '1';

    const syncPathFromTitle = () => {
      const currentPath = String(pathInput.value || '');
      if (!isInvalidPath(currentPath)) {
        return;
      }

      const slug = slugifyTitle(titleInput.value || '');
      const nextPath = rewritePath(currentPath, slug);
      if (!nextPath || nextPath === currentPath) {
        return;
      }

      pathInput.value = nextPath;
      pathInput.dispatchEvent(new Event('input', { bubbles: true }));
      pathInput.dispatchEvent(new Event('change', { bubbles: true }));
    };

    titleInput.addEventListener('input', syncPathFromTitle);
    titleInput.addEventListener('blur', syncPathFromTitle);
    syncPathFromTitle();
  }

  function cleanupAdminServiceWorkers() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const reloadKey = 'nlo_admin_sw_cleanup_done';

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        const adminRegistrations = registrations.filter((registration) =>
          registration.scope.includes('/admin')
        );

        if (!adminRegistrations.length) {
          sessionStorage.removeItem(reloadKey);
          return;
        }

        Promise.all(adminRegistrations.map((registration) => registration.unregister().catch(() => false)))
          .then(() => {
            if (!sessionStorage.getItem(reloadKey)) {
              sessionStorage.setItem(reloadKey, '1');
              window.location.reload();
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  }

  function resolveCodeMirror(toolbar) {
    const focused = document.querySelector('.CodeMirror-focused');
    if (focused && focused.CodeMirror) {
      return focused.CodeMirror;
    }

    const wrapper = toolbar.closest('.editor-wrapper') || document;
    const local = wrapper.querySelector('.CodeMirror');
    if (local && local.CodeMirror) {
      return local.CodeMirror;
    }

    const first = document.querySelector('.CodeMirror');
    return first ? first.CodeMirror : null;
  }

  function insertSnippet(toolbar, snippet) {
    const cm = resolveCodeMirror(toolbar);
    if (cm) {
      cm.replaceSelection(snippet);
      cm.focus();
      return;
    }

    const area = document.querySelector('textarea');
    if (!area) {
      return;
    }

    const start = area.selectionStart || 0;
    const end = area.selectionEnd || start;
    const before = area.value.slice(0, start);
    const after = area.value.slice(end);

    area.value = `${before}${snippet}${after}`;
    area.dispatchEvent(new Event('input', { bubbles: true }));
    area.focus();
  }

  function buildSnippetButton(toolbar, key, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'nlo-admin-snippet-btn';
    const kindClass = snippetButtonKinds[key];
    if (kindClass) {
      button.classList.add(kindClass);
    }
    button.textContent = label;

    button.addEventListener('click', () => {
      const snippet = snippets[key];
      if (snippet) {
        insertSnippet(toolbar, snippet);
      }
    });

    return button;
  }

  function mountSnippetToolbar(toolbar) {
    if (!toolbar || toolbar.dataset.nloSnippetsMounted === '1') {
      return;
    }

    toolbar.dataset.nloSnippetsMounted = '1';

    const panel = document.createElement('div');
    panel.className = 'nlo-admin-snippets';

    panel.appendChild(buildSnippetButton(toolbar, 'prompt_tip', 'Tip'));
    panel.appendChild(buildSnippetButton(toolbar, 'prompt_info', 'Info'));
    panel.appendChild(buildSnippetButton(toolbar, 'prompt_warning', 'Warning'));
    panel.appendChild(buildSnippetButton(toolbar, 'prompt_danger', 'Danger'));
    panel.appendChild(buildSnippetButton(toolbar, 'table', 'Table'));
    panel.appendChild(buildSnippetButton(toolbar, 'footnote', 'Footnote'));
    panel.appendChild(buildSnippetButton(toolbar, 'image_modes', 'Light/Dark image'));

    toolbar.insertAdjacentElement('afterend', panel);
  }

  function scanEditors() {
    document.querySelectorAll('.editor-toolbar').forEach((toolbar) => {
      mountSnippetToolbar(toolbar);
    });
  }

  function suppressFalseConfigErrorNotice() {
    if (!window.__nloAdminConfigFetchOk) {
      return;
    }

    const notifications = document.querySelectorAll('.notification');
    notifications.forEach((notification) => {
      const message = notification.querySelector('.notification-message');
      const text = (message?.textContent || '').trim().toLowerCase();
      if (text === 'could not fetch the config') {
        notification.remove();
      }
    });
  }

  function boot() {
    cleanupAdminServiceWorkers();
    ensureThemeToggle();
    ensureGhPalettePicker();
    ensureAvatarFramePicker();
    void ensureSidebarBranding();
    ensurePathAutofill();
    scanEditors();
    suppressFalseConfigErrorNotice();

    const observer = new MutationObserver(() => {
      ensureThemeToggle();
      ensureGhPalettePicker();
      ensureAvatarFramePicker();
      void ensureSidebarBranding();
      ensurePathAutofill();
      scanEditors();
      suppressFalseConfigErrorNotice();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!sessionStorage.getItem(MODE_KEY)) {
        applyMode(systemMode());
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
