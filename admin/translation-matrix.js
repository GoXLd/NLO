(() => {
  const MODE_KEY = 'mode';
  const STATUS_LABELS = {
    source: 'Source',
    up_to_date: 'Up-to-date',
    outdated: 'Outdated',
    untracked: 'Untracked',
    missing: 'Missing'
  };

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
      return `${prefixFromPath}/admin/#/posts`;
    }

    if (prefixFromConfig) {
      return `${prefixFromConfig}/admin/#/posts`;
    }

    return '/admin/#/posts';
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
    let outdatedCount = 0;
    let missingCount = 0;
    let untrackedCount = 0;

    (data.items || []).forEach((item) => {
      (data.languages || []).forEach((lang) => {
        const status = item.by_language?.[lang]?.status || 'missing';
        if (status === 'outdated') {
          outdatedCount += 1;
        } else if (status === 'missing') {
          missingCount += 1;
        } else if (status === 'untracked') {
          untrackedCount += 1;
        }
      });
    });

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

    const badge4 = document.createElement('span');
    badge4.className = 'nlo-admin-matrix-badge is-warning';
    badge4.textContent = `Outdated: ${outdatedCount}`;

    const badge5 = document.createElement('span');
    badge5.className = 'nlo-admin-matrix-badge';
    badge5.textContent = `Missing: ${missingCount}`;

    const badge6 = document.createElement('span');
    badge6.className = 'nlo-admin-matrix-badge';
    badge6.textContent = `Untracked: ${untrackedCount}`;

    meta.appendChild(badge1);
    meta.appendChild(badge2);
    meta.appendChild(badge3);
    meta.appendChild(badge4);
    meta.appendChild(badge5);
    meta.appendChild(badge6);
  }

  function statusText(entry, item) {
    const status = entry?.status || 'missing';
    if (status === 'source') {
      return `${STATUS_LABELS.source} r${item.source_revision || 1}`;
    }

    if (status === 'up_to_date') {
      const revision = entry.revision || item.source_revision || 1;
      return `${STATUS_LABELS.up_to_date} r${revision}`;
    }

    if (status === 'outdated') {
      const revision = entry.revision ? `r${entry.revision}` : 'r?';
      return `${STATUS_LABELS.outdated} ${revision}/r${item.source_revision || 1}`;
    }

    return STATUS_LABELS[status] || status;
  }

  function statusTitle(entry, item) {
    const files = Array.isArray(entry?.files) ? entry.files : [];
    const lines = [];
    lines.push(`Status: ${statusText(entry, item)}`);
    if (item.source_language) {
      lines.push(`Source: ${item.source_language} (r${item.source_revision || 1})`);
    }
    if (entry?.primary_file) {
      lines.push(`Primary file: ${entry.primary_file}`);
    }
    if (files.length) {
      lines.push(`Files:\n${files.join('\n')}`);
    }
    return lines.join('\n');
  }

  function statusClass(status) {
    return String(status || 'missing').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
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

    const headers = ['Translation Key', 'Title', 'Source', ...(data.languages || [])];
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

      const sourceCell = document.createElement('td');
      sourceCell.className = 'nlo-admin-matrix-source';
      sourceCell.textContent = `${item.source_language || '-'} · r${item.source_revision || 1}`;
      if (item.source_file) {
        sourceCell.title = item.source_file;
      }
      row.appendChild(sourceCell);

      (data.languages || []).forEach((lang) => {
        const langCell = document.createElement('td');
        const entry = item.by_language?.[lang] || { available: false, files: [], status: 'missing' };
        const pill = document.createElement('span');
        pill.className = `nlo-admin-matrix-pill is-${statusClass(entry.status)}`;
        pill.textContent = statusText(entry, item);
        pill.title = statusTitle(entry, item);
        langCell.className = 'nlo-admin-matrix-lang';
        langCell.appendChild(pill);

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
