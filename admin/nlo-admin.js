(() => {
  const MODE_KEY = 'mode';
  const root = document.documentElement;

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

  function applyMode(mode) {
    root.setAttribute('data-mode', mode);
    sessionStorage.setItem(MODE_KEY, mode);

    const toggle = document.getElementById('nlo-admin-theme-toggle');
    if (toggle) {
      toggle.textContent = `Theme: ${modeLabel(mode)}`;
      toggle.setAttribute('aria-label', `Switch theme. Current: ${modeLabel(mode)}`);
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
    ensureThemeToggle();
    scanEditors();

    const observer = new MutationObserver(() => {
      ensureThemeToggle();
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
