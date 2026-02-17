(() => {
  const MODE_KEY = 'mode';
  const GH_PALETTE_KEY = 'gh_palette';
  const DEFAULT_GH_PALETTE = 'slate-a';
  const root = document.documentElement;
  const chartPalettes = {
    'slate-a': {
      label: 'Slate A',
      dark: ['#1b1b1b', '#22252a', '#2b3038', '#343c47', '#3f4a59']
    },
    'slate-b': {
      label: 'Slate B',
      dark: ['#1a1a1a', '#23272d', '#2d333b', '#38414b', '#44505c']
    },
    'nlo-logo': {
      label: 'NLO Logo',
      dark: ['#2a2d30', '#223244', '#2c4a66', '#3a6488', '#b35a2a'],
      light: ['#e6e8eb', '#c9d9e7', '#8fb2cc', '#2c5472', '#c8632d']
    }
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
      "![light mode only](/posts/20190808/devtools-light.png){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }\n" +
      "![dark mode only](/posts/20190808/devtools-dark.png){: .dark .w-75 .shadow .rounded-10 w='1212' h='668' }\n\n"
  };

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
    const saved = sessionStorage.getItem(GH_PALETTE_KEY);
    if (saved && chartPalettes[saved]) {
      return saved;
    }

    const attr = root.getAttribute('data-gh-palette');
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
    const paletteName = chartPalettes[name] ? name : DEFAULT_GH_PALETTE;
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
    } catch (_e) {
      // ignore fallback copy failures
    } finally {
      area.remove();
    }
  }

  function ensureGhPalettePicker() {
    if (document.getElementById('nlo-admin-gh-palette-picker')) {
      return;
    }

    const wrapper = document.createElement('section');
    wrapper.id = 'nlo-admin-gh-palette-picker';

    const label = document.createElement('p');
    label.id = 'nlo-admin-gh-palette-label';
    label.className = 'nlo-admin-gh-label';
    wrapper.appendChild(label);

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
    copy.addEventListener('click', () => copyPaletteEnv(copy));

    controls.appendChild(select);
    controls.appendChild(copy);
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

    document.body.appendChild(wrapper);
    applyGhPalette(currentGhPalette());
  }

  function cleanupAdminServiceWorkers() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.scope.includes('/admin')) {
            registration.unregister().catch(() => {});
          }
        });
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

  function boot() {
    cleanupAdminServiceWorkers();
    ensureThemeToggle();
    ensureGhPalettePicker();
    scanEditors();

    const observer = new MutationObserver(() => {
      ensureThemeToggle();
      ensureGhPalettePicker();
      scanEditors();
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
