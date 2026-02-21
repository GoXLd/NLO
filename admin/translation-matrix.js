(() => {
  const MODE_KEY = 'mode';

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

  function resolveAdminPathPrefix() {
    const pathname = String(window.location.pathname || '');
    const adminIndex = pathname.indexOf('/admin');
    if (adminIndex <= 0) {
      return '';
    }

    return trimTrailingSlash(pathname.slice(0, adminIndex));
  }

  function applyMode() {
    const saved = sessionStorage.getItem(MODE_KEY);
    const mode = saved === 'light' || saved === 'dark' ? saved : 'dark';
    document.documentElement.setAttribute('data-mode', mode);
  }

  async function fetchConfig() {
    const response = await fetch('/_api/configuration', {
      credentials: 'same-origin',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Configuration request failed (${response.status})`);
    }

    const payload = await response.json();
    return payload?.content && typeof payload.content === 'object' ? payload.content : payload;
  }

  function matrixEndpoint(baseurl) {
    const suffix = '/_nlo/translation-matrix/data';
    const prefixFromPath = resolveAdminPathPrefix();
    const prefixFromConfig = normalizeBaseurl(baseurl);

    if (prefixFromPath) {
      return `${prefixFromPath}/admin${suffix}`;
    }

    if (prefixFromConfig) {
      return `${prefixFromConfig}/admin${suffix}`;
    }

    return `/admin${suffix}`;
  }

  function adminPostsUrl(baseurl) {
    const prefixFromPath = resolveAdminPathPrefix();
    const prefixFromConfig = normalizeBaseurl(baseurl);

    if (prefixFromPath) {
      return `${prefixFromPath}/admin/posts`;
    }

    if (prefixFromConfig) {
      return `${prefixFromConfig}/admin/posts`;
    }

    return '/admin/posts';
  }

  function setStatus(message, isError = false) {
    const status = document.getElementById('nlo-admin-matrix-status');
    if (!status) {
      return;
    }

    status.textContent = message || '';
    status.dataset.state = isError ? 'error' : 'ok';
  }

  function humanDate(value) {
    if (!value) {
      return 'Unknown';
    }

    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      return String(value);
    }

    return date.toLocaleString();
  }

  function renderMeta(data) {
    const meta = document.getElementById('nlo-admin-matrix-meta');
    if (!meta) {
      return;
    }

    const langs = (data.languages || []).join(', ');
    meta.innerHTML = '';

    const badge1 = document.createElement('span');
    badge1.className = 'nlo-admin-matrix-badge';
    badge1.textContent = `Languages: ${langs || '-'}`;

    const badge2 = document.createElement('span');
    badge2.className = 'nlo-admin-matrix-badge';
    badge2.textContent = `Groups: ${data.total_groups || 0}`;

    const badge3 = document.createElement('span');
    badge3.className = 'nlo-admin-matrix-badge';
    badge3.textContent = `Updated: ${humanDate(data.generated_at)}`;

    meta.appendChild(badge1);
    meta.appendChild(badge2);
    meta.appendChild(badge3);
  }

  function renderTable(data) {
    const table = document.getElementById('nlo-admin-matrix-table');
    if (!table) {
      return;
    }

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) {
      return;
    }

    thead.innerHTML = '';
    tbody.innerHTML = '';

    const headers = ['Translation Key', 'Title', ...(data.languages || [])];
    const headerRow = document.createElement('tr');
    headers.forEach((text) => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    (data.items || []).forEach((item) => {
      const row = document.createElement('tr');

      const keyCell = document.createElement('td');
      keyCell.className = 'nlo-admin-matrix-key';
      keyCell.textContent = item.translation_key || '-';
      row.appendChild(keyCell);

      const titleCell = document.createElement('td');
      titleCell.className = 'nlo-admin-matrix-title';
      titleCell.textContent = item.title || '-';
      row.appendChild(titleCell);

      (data.languages || []).forEach((lang) => {
        const langCell = document.createElement('td');
        const entry = item.by_language?.[lang] || { available: false, files: [] };
        const files = Array.isArray(entry.files) ? entry.files : [];

        if (entry.available) {
          langCell.className = 'nlo-admin-matrix-lang is-available';
          langCell.textContent = 'Yes';
          if (files.length) {
            langCell.title = files.join('\n');
          }
        } else {
          langCell.className = 'nlo-admin-matrix-lang is-missing';
          langCell.textContent = '—';
        }

        row.appendChild(langCell);
      });

      tbody.appendChild(row);
    });
  }

  function enableCopyButton(payload) {
    const copyButton = document.getElementById('nlo-admin-matrix-copy');
    if (!copyButton) {
      return;
    }

    copyButton.disabled = false;
    copyButton.addEventListener('click', async () => {
      const originalText = copyButton.textContent;
      try {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        copyButton.textContent = 'Copied';
        setStatus('JSON copied to clipboard.');
      } catch (error) {
        copyButton.textContent = 'Failed';
        setStatus(`Copy failed: ${error.message}`, true);
      } finally {
        window.setTimeout(() => {
          copyButton.textContent = originalText;
        }, 1200);
      }
    });
  }

  async function boot() {
    applyMode();

    try {
      const config = await fetchConfig();

      const back = document.getElementById('nlo-admin-matrix-back');
      if (back) {
        back.href = adminPostsUrl(config?.baseurl || '');
      }

      const response = await fetch(matrixEndpoint(config?.baseurl || ''), {
        credentials: 'same-origin',
        cache: 'no-store'
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok || !payload?.data) {
        throw new Error(payload?.error || `Request failed (${response.status})`);
      }

      renderMeta(payload.data);
      renderTable(payload.data);
      enableCopyButton(payload.data);
      setStatus('Matrix is up to date.');
    } catch (error) {
      setStatus(`Error: ${error.message}`, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
