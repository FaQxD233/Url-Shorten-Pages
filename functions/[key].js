const config = {
  snapchat_mode: false,
}

const protect_keylist = ["api", "password"]

const notFoundText = "404 Not Found"

const adminHtmlTemplate = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>URL Shortener</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --bg: #FAFAF9;
      --text: #0A0A0A;
      --text-secondary: #737373;
      --border: #E5E5E5;
      --accent: #171717;
      --hover: #404040;
      --claude-orange: #E87A3E;
      --claude-orange-hover: #D66B31;
      --danger: #DC2626;
      --danger-hover: #B91C1C;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      max-width: 980px;
      margin: 0 auto;
      padding: 80px 24px;
    }

    h1 {
      font-size: 32px;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 48px;
    }

    .section {
      margin-bottom: 64px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 240px 120px;
      gap: 12px;
      margin-bottom: 16px;
      align-items: start;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    input,
    textarea {
      width: 100%;
      padding: 10px 12px;
      font-family: inherit;
      font-size: 15px;
      color: var(--text);
      background: white;
      border: 1px solid var(--border);
      border-radius: 6px;
      transition: border-color 0.2s;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--accent);
    }

    textarea {
      resize: vertical;
      min-height: 38px;
      font-family: 'SF Mono', Menlo, Monaco, monospace;
      font-size: 14px;
      line-height: 1.4;
    }

    button {
      height: 38px;
      padding: 0 16px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      color: white;
      background: var(--accent);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }

    button:hover {
      background: var(--hover);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--claude-orange);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--claude-orange-hover);
    }

    .btn-ghost {
      color: var(--text);
      background: transparent;
      border: 1px solid var(--border);
    }

    .btn-ghost:hover {
      background: white;
    }

    .btn-danger {
      color: var(--danger);
      background: transparent;
      border: 1px solid var(--danger);
    }

    .btn-danger:hover {
      background: var(--danger);
      color: white;
    }

    .btn-danger.confirm {
      background: var(--danger);
      color: white;
    }

    .btn-danger.confirm:hover {
      background: var(--danger-hover);
    }

    .toolbar {
      display: flex;
      gap: 8px;
    }

    .status {
      padding: 12px 14px;
      font-size: 14px;
      color: var(--text-secondary);
      background: white;
      border: 1px solid var(--border);
      border-radius: 6px;
    }

    .status.success {
      color: #059669;
      background: #ECFDF5;
      border-color: #059669;
    }

    .status.error {
      color: var(--danger);
      background: #FEF2F2;
      border-color: var(--danger);
    }

    .table-wrapper {
      background: white;
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .table-header {
      padding: 20px 24px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .table-header h2 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }

    .table-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .count {
      font-size: 14px;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .search-box {
      width: 220px;
      padding: 8px 12px;
      font-family: inherit;
      font-size: 14px;
      color: var(--text);
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
    }

    .search-box:focus {
      outline: none;
      border-color: var(--accent);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    th {
      padding: 10px 24px;
      font-size: 12px;
      font-weight: 500;
      text-align: left;
      color: var(--text-secondary);
    }

    td {
      padding: 16px 24px;
      font-size: 14px;
      border-top: 1px solid var(--border);
      vertical-align: middle;
    }

    tbody tr:first-child td {
      border-top: none;
    }

    tbody tr.hidden {
      display: none;
    }

    .cell-link {
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
      word-break: break-all;
    }

    .cell-link:hover {
      text-decoration: underline;
    }

    .cell-url {
      color: var(--text-secondary);
      font-family: 'SF Mono', Menlo, Monaco, monospace;
      font-size: 13px;
      word-break: break-all;
    }

    .cell-actions {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .cell-actions button {
      height: 32px;
      padding: 0 12px;
      font-size: 13px;
    }

    .empty {
      padding: 60px 24px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .page {
        padding: 40px 20px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-grid .form-field:last-child button {
        width: 100%;
      }

      .table-wrapper {
        border: none;
        border-radius: 0;
      }

      .table-header {
        padding: 16px 0;
        flex-direction: column;
        align-items: flex-start;
      }

      .table-controls {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        width: 100%;
      }

      table,
      thead,
      tbody,
      tr,
      th,
      td {
        display: block;
      }

      thead {
        display: none;
      }

      tr {
        margin-bottom: 16px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: white;
      }

      td {
        padding: 12px 16px;
        border: none;
      }

      td:first-child {
        padding-top: 16px;
      }

      td:last-child {
        padding-bottom: 16px;
      }

      .cell-actions {
        margin-top: 8px;
      }

      .cell-actions button {
        flex: 1;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <h1>URL Shortener</h1>
    </header>

    <section class="section">
      <h2 class="section-title">New Link</h2>

      <form id="shortenForm">
        <div class="form-grid">
          <div class="form-field">
            <label for="longURL">Destination URL</label>
            <textarea id="longURL" placeholder="https://example.com/long/path" required></textarea>
          </div>

          <div class="form-field">
            <label for="keyPhrase">Custom key</label>
            <input id="keyPhrase" type="text" maxlength="64" placeholder="my-link">
          </div>

          <div class="form-field">
            <label>&nbsp;</label>
            <button id="addBtn" type="submit" class="btn-primary">Create</button>
          </div>
        </div>

        <div class="toolbar">
          <button id="loadKVBtn" type="button" class="btn-ghost">Sync from KV</button>
          <button id="clearLocalBtn" type="button" class="btn-ghost">Clear cache</button>
        </div>

        <div class="status" id="result">Ready</div>
      </form>
    </section>

    <section class="section">
      <div class="table-wrapper">
        <div class="table-header">
          <h2>Links</h2>
          <div class="table-controls">
            <span class="count" id="linkCount">0 total</span>
            <input type="text" id="searchBox" class="search-box" placeholder="Search links...">
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30%;">Key</th>
              <th>Destination</th>
              <th style="width: 200px;"></th>
            </tr>
          </thead>
          <tbody id="urlList">
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <script>
    const apiBase = "__API_BASE__";
    const password = "__PASSWORD__";
    const storagePrefix = "usw:item:";

    const els = {
      form: document.querySelector("#shortenForm"),
      longURL: document.querySelector("#longURL"),
      keyPhrase: document.querySelector("#keyPhrase"),
      addBtn: document.querySelector("#addBtn"),
      loadKVBtn: document.querySelector("#loadKVBtn"),
      clearLocalBtn: document.querySelector("#clearLocalBtn"),
      result: document.querySelector("#result"),
      urlList: document.querySelector("#urlList"),
      linkCount: document.querySelector("#linkCount"),
      searchBox: document.querySelector("#searchBox"),
    };

    let allLinks = [];
    const deleteConfirmState = new Map();

    function setResult(text, type = 'default') {
      els.result.textContent = text;
      els.result.className = 'status';
      if (type === 'success') els.result.classList.add('success');
      if (type === 'error') els.result.classList.add('error');
    }

    async function apiRequest(payload) {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, password }),
      });
      const data = await response.json();
      if (data.status != 200) throw new Error(data.error || "Request failed");
      return data;
    }

    function shortUrlFor(key) {
      return window.location.origin + "/" + encodeURIComponent(key);
    }

    function saveLocal(key, value) {
      localStorage.setItem(storagePrefix + key, value);
    }

    function removeLocal(key) {
      localStorage.removeItem(storagePrefix + key);
    }

    function localItems() {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const name = localStorage.key(i);
        if (name && name.startsWith(storagePrefix)) {
          items.push({ key: name.slice(storagePrefix.length), value: localStorage.getItem(name) });
        }
      }
      items.sort((a, b) => a.key.localeCompare(b.key));
      return items;
    }

    function filterLinks(searchTerm) {
      const term = searchTerm.toLowerCase();
      const rows = els.urlList.querySelectorAll('tr');

      rows.forEach(row => {
        const key = row.dataset.key || '';
        const url = row.dataset.url || '';
        if (key.toLowerCase().includes(term) || url.toLowerCase().includes(term)) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });

      updateCount();
    }

    function updateCount() {
      const total = allLinks.length;
      const visible = els.urlList.querySelectorAll('tr:not(.hidden)').length;
      if (els.searchBox.value.trim()) {
        els.linkCount.textContent = visible + ' of ' + total + ' total';
      } else {
        els.linkCount.textContent = total + ' total';
      }
    }

    function renderLocal() {
      allLinks = localItems();
      els.urlList.innerHTML = "";

      if (!allLinks.length) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 3;
        emptyCell.className = "empty";
        emptyCell.textContent = "No links yet. Create your first short link above.";
        emptyRow.appendChild(emptyCell);
        els.urlList.appendChild(emptyRow);
        updateCount();
        return;
      }

      for (const item of allLinks) {
        const row = document.createElement("tr");
        row.dataset.key = item.key;
        row.dataset.url = item.value;

        const keyCell = document.createElement("td");
        const link = document.createElement("a");
        link.className = "cell-link";
        link.href = shortUrlFor(item.key);
        link.textContent = item.key;
        link.target = "_blank";
        keyCell.appendChild(link);

        const urlCell = document.createElement("td");
        const urlDiv = document.createElement("div");
        urlDiv.className = "cell-url";
        urlDiv.textContent = item.value;
        urlCell.appendChild(urlDiv);

        const actionsCell = document.createElement("td");
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "cell-actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "btn-ghost";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
          els.keyPhrase.value = item.key;
          els.longURL.value = item.value;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setResult("Link loaded into form", "success");
        });

        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "btn-ghost";
        copyBtn.textContent = "Copy";
        copyBtn.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(shortUrlFor(item.key));
            setResult("Copied: " + shortUrlFor(item.key), "success");
          } catch (e) {
            setResult("Failed to copy", "error");
          }
        });

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn-danger";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => handleDelete(delBtn, item.key));

        actionsDiv.append(editBtn, copyBtn, delBtn);
        actionsCell.appendChild(actionsDiv);

        row.append(keyCell, urlCell, actionsCell);
        els.urlList.appendChild(row);
      }

      updateCount();
    }

    function handleDelete(btn, key) {
      if (deleteConfirmState.get(key)) {
        deleteRecord(key);
        deleteConfirmState.delete(key);
      } else {
        btn.textContent = "Confirm?";
        btn.classList.add("confirm");
        deleteConfirmState.set(key, true);

        setTimeout(() => {
          btn.textContent = "Delete";
          btn.classList.remove("confirm");
          deleteConfirmState.delete(key);
        }, 3000);
      }
    }

    async function createShortUrl(event) {
      event.preventDefault();
      const url = els.longURL.value.trim();
      const key = els.keyPhrase.value.trim();
      if (!url) return setResult("URL is required", "error");

      els.addBtn.disabled = true;
      setResult("Creating link...");

      try {
        const data = await apiRequest({ cmd: "add", url, key });
        saveLocal(data.key, url);
        renderLocal();
        setResult("Link created: " + shortUrlFor(data.key), "success");
        els.longURL.value = "";
        els.keyPhrase.value = "";
      } catch (error) {
        setResult(error.message, "error");
      } finally {
        els.addBtn.disabled = false;
      }
    }

    async function loadKV() {
      setResult("Syncing from KV...");
      try {
        const data = await apiRequest({ cmd: "qryall" });
        localStorage.clear();
        for (const item of data.kvlist) {
          saveLocal(item.key, item.value);
        }
        renderLocal();
        setResult("Synced " + data.kvlist.length + " links from KV", "success");
      } catch (error) {
        setResult(error.message, "error");
      }
    }

    async function deleteRecord(key) {
      try {
        await apiRequest({ cmd: "del", key });
        removeLocal(key);
        renderLocal();
        setResult("Deleted: " + key, "success");
      } catch (error) {
        setResult(error.message, "error");
      }
    }

    els.form.addEventListener("submit", createShortUrl);
    els.loadKVBtn.addEventListener("click", loadKV);
    els.clearLocalBtn.addEventListener("click", () => {
      if (!confirm("Clear all local cache?")) return;
      localStorage.clear();
      renderLocal();
      setResult("Local cache cleared", "success");
    });
    els.searchBox.addEventListener("input", (e) => {
      filterLinks(e.target.value);
    });

    // 智能加载：首次访问自动加载 KV，后续使用本地缓存
    if (localItems().length === 0) {
      loadKV();
    } else {
      renderLocal();
    }
  </script>
</body>
</html>`

async function systemPassword(env) {
  if (env.USW_PASSWORD && env.USW_PASSWORD.trim()) {
    return env.USW_PASSWORD.trim()
  }
  return (await env.LINKS.get("password")) || ""
}

export async function onRequestGet({ request, env, params }) {
  const key = decodeURIComponent(params.key || "")

  if (!env.LINKS) {
    return new Response("Missing KV binding LINKS.", { status: 500 })
  }

  const password = await systemPassword(env)
  if (password && key === password) {
    const adminHtml = adminHtmlTemplate
      .replace(/__PASSWORD__/gm, password)
      .replace(/__API_BASE__/gm, new URL(request.url).origin + "/api")

    return new Response(adminHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    })
  }

  if (protect_keylist.includes(key)) {
    return new Response(notFoundText, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
    })
  }

  let value = await env.LINKS.get(key)
  if (!value) {
    return new Response(notFoundText, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
    })
  }

  if (config.snapchat_mode) {
    await env.LINKS.delete(key)
  }

  const requestUrl = new URL(request.url)
  if (requestUrl.search) {
    value += requestUrl.search
  }

  return Response.redirect(value, 302)
}
