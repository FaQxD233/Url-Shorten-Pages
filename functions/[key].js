import { constantTimeCompare, getSystemPassword, PROTECTED_KEYS } from './_shared.js'

const config = {
  snapchat_mode: false,
}

const notFoundText = "404 Not Found"

const adminHtmlTemplate = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>URL Shortener</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.0.3/dist/fonts/geist-sans/style.css">
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
      --shadow-sm: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      --focus-ring: 0 0 0 3px rgba(232, 122, 62, 0.15);
    }

    body {
      font-family: 'Geist', 'Geist Sans', 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif;
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
      grid-template-columns: 1fr 240px max-content;
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
      transition: all 0.2s ease;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.01);
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: var(--claude-orange);
      box-shadow: var(--focus-ring);
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
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    button:not(.action-btn):hover:not(:disabled) {
      background: var(--hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    button:not(.action-btn):active:not(:disabled) {
      transform: translateY(0);
      box-shadow: none;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--claude-orange);
    }

    .btn-primary:not(.action-btn):hover:not(:disabled) {
      background: var(--claude-orange-hover);
      box-shadow: 0 4px 12px rgba(232, 122, 62, 0.25);
    }

    .btn-ghost {
      color: var(--text);
      background: transparent;
      border: 1px solid var(--border);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-ghost:not(.action-btn):hover:not(:disabled) {
      background: white;
      border-color: var(--claude-orange);
      color: var(--claude-orange);
      box-shadow: 0 4px 12px rgba(232, 122, 62, 0.15);
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
      margin-top: 16px;
    }

    .status {
      padding: 12px 14px;
      font-size: 14px;
      color: var(--text-secondary);
      background: white;
      border: 1px solid var(--border);
      border-radius: 6px;
      margin-top: 16px;
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
      box-shadow: var(--shadow-md);
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
      table-layout: fixed;
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

    tbody tr {
      transition: background-color 0.15s ease;
    }

    tbody tr:hover {
      background-color: #F9FAFB;
    }

    tbody tr.hidden {
      display: none;
    }

    .cell-link {
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cell-link:hover {
      text-decoration: underline;
    }

    .cell-url {
      color: var(--text-secondary);
      font-family: 'SF Mono', Menlo, Monaco, monospace;
      font-size: 13px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.5;
    }

    .cell-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      opacity: 0;
      transform: translateX(8px);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    tbody tr:hover .cell-actions {
      opacity: 1;
      transform: translateX(0);
    }

    .action-btn {
      background: transparent;
      border: none;
      padding: 0;
      height: auto;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      transition: color 0.15s ease;
    }

    .action-btn:hover {
      background: transparent;
      color: var(--text);
      transform: none;
      box-shadow: none;
    }

    .action-btn.danger:hover {
      background: transparent;
      color: var(--danger);
    }

    .empty {
      padding: 60px 24px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .empty-state {
      padding: 64px 20px;
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .empty-state-icon {
      font-size: 24px;
      opacity: 0.5;
    }

    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 50;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .toast {
      background: white;
      color: var(--text);
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-left: 4px solid var(--claude-orange);
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .toast.error {
      border-left-color: var(--danger);
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes fadeOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #D4D4D4;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #A3A3A3;
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
        box-shadow: none;
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
        box-shadow: var(--shadow-sm);
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
        justify-content: flex-start;
        gap: 20px;
        opacity: 1;
        transform: none;
      }

      .toast-container {
        left: 20px;
        right: 20px;
        bottom: 20px;
        align-items: stretch;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <header style="display: flex; justify-content: space-between; align-items: flex-start;">
      <h1 data-i18n="title">URL Shortener</h1>
      <button id="langToggleBtn" class="btn-ghost" style="height: 32px; padding: 0 12px; font-size: 13px;">中 / EN</button>
    </header>

    <section class="section">
      <h2 class="section-title" data-i18n="newLink">New Link</h2>

      <form id="shortenForm">
        <div class="form-grid">
          <div class="form-field">
            <label for="longURL" data-i18n="destUrl">Destination URL</label>
            <textarea id="longURL" placeholder="https://example.com/long/path" required></textarea>
          </div>

          <div class="form-field">
            <label for="keyPhrase" data-i18n="customKey">Custom key</label>
            <input id="keyPhrase" type="text" maxlength="64" placeholder="my-link" data-i18n-placeholder="customKeyPlaceholder">
          </div>

          <div class="form-field">
            <label>&nbsp;</label>
            <button id="addBtn" type="submit" class="btn-primary" data-i18n="createBtn">Create</button>
          </div>
        </div>

        <div class="toolbar">
          <button id="loadKVBtn" type="button" class="btn-ghost" data-i18n="syncBtn">Sync from KV</button>
          <button id="clearLocalBtn" type="button" class="btn-ghost" data-i18n="clearBtn">Clear cache</button>
        </div>

        <div class="status" id="result" data-i18n="statusReady">Ready</div>
      </form>
    </section>

    <section class="section">
      <div class="table-wrapper">
        <div class="table-header">
          <h2 data-i18n="linksTitle">Links</h2>
          <div class="table-controls">
            <span class="count" id="linkCount">0 total</span>
            <input type="text" id="searchBox" class="search-box" placeholder="Search links..." data-i18n-placeholder="searchPlaceholder">
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30%;" data-i18n="thKey">Key</th>
              <th data-i18n="thDest">Destination</th>
              <th style="width: 200px;"></th>
            </tr>
          </thead>
          <tbody id="urlList">
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <div id="toastContainer" class="toast-container"></div>

  <script>
    const apiBase = "__API_BASE__";
    const password = "__PASSWORD__";
    const storagePrefix = "usw:item:";

    // i18n 字典
    const dict = {
      en: {
        title: 'URL Shortener', newLink: 'New Link', destUrl: 'Destination URL', customKey: 'Custom key', customKeyPlaceholder: 'my-link', createBtn: 'Create', creatingBtn: 'Creating...', syncBtn: 'Sync from KV', syncingBtn: 'Syncing...', clearBtn: 'Clear cache', statusReady: 'Ready', linksTitle: 'Links', searchPlaceholder: 'Search links...', thKey: 'Key', thDest: 'Destination', btnEdit: 'Edit', btnCopy: 'Copy', btnDelete: 'Delete', totalFormat: (n, v) => v ? \`\${v} of \${n} total\` : \`\${n} total\`, msgCreated: 'Link created: ', msgCopied: 'Copied: ', msgFailed: 'Failed to copy', msgDeleted: 'Deleted: ', msgSynced: (n) => \`Synced \${n} links from KV\`, msgCleared: 'Local cache cleared', msgLoaded: 'Link loaded into form', msgCreating: 'Creating link...', msgSyncing: 'Syncing from KV...', msgUrlRequired: 'URL is required', emptyText: 'No links yet. Create your first short link above.'
      },
      zh: {
        title: '短链接生成器', newLink: '创建新链接', destUrl: '目标 URL', customKey: '自定义短链', customKeyPlaceholder: '例如: my-link', createBtn: '生成', creatingBtn: '生成中...', syncBtn: '同步 KV', syncingBtn: '同步中...', clearBtn: '清理缓存', statusReady: '已就绪', linksTitle: '所有链接', searchPlaceholder: '搜索短链...', thKey: '短链', thDest: '目标地址', btnEdit: '编辑', btnCopy: '复制', btnDelete: '删除', totalFormat: (n, v) => v ? \`\${v} / 共 \${n} 条\` : \`共 \${n} 条记录\`, msgCreated: '已创建链接: ', msgCopied: '已复制: ', msgFailed: '复制失败', msgDeleted: '已删除: ', msgSynced: (n) => \`已同步 \${n} 条记录\`, msgCleared: '已清理本地缓存', msgLoaded: '已将链接信息填入表单', msgCreating: '正在创建链接...', msgSyncing: '正在同步...', msgUrlRequired: '请输入 URL', emptyText: '还没有短链。请在上方创建第一个短链。'
      }
    };

    let currentLang = navigator.language.startsWith('zh') ? 'zh' : 'en';

    function updateI18n() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[currentLang][key]) el.textContent = dict[currentLang][key];
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[currentLang][key]) el.placeholder = dict[currentLang][key];
      });
      updateCount();
    }

    function showToast(message, isError = false) {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'toast' + (isError ? ' error' : '');
      toast.textContent = message;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        setTimeout(() => container.removeChild(toast), 300);
      }, 3000);
    }

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
      langToggleBtn: document.querySelector("#langToggleBtn"),
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
      els.linkCount.textContent = dict[currentLang].totalFormat(total, els.searchBox.value.trim() ? visible : 0);
    }

    function renderLocal() {
      allLinks = localItems();
      els.urlList.innerHTML = "";

      if (!allLinks.length) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 3;
        emptyCell.className = "empty";
        emptyCell.textContent = dict[currentLang].emptyText;
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
        link.title = item.key;
        keyCell.appendChild(link);

        const urlCell = document.createElement("td");
        const urlDiv = document.createElement("div");
        urlDiv.className = "cell-url";
        urlDiv.textContent = item.value;
        urlDiv.title = item.value;
        urlCell.appendChild(urlDiv);

        const actionsCell = document.createElement("td");
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "cell-actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "action-btn";
        editBtn.setAttribute('data-i18n', 'btnEdit');
        editBtn.textContent = dict[currentLang].btnEdit;
        editBtn.addEventListener("click", () => {
          els.keyPhrase.value = item.key;
          els.longURL.value = item.value;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          els.longURL.focus();
          showToast(dict[currentLang].msgLoaded);
        });

        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "action-btn";
        copyBtn.setAttribute('data-i18n', 'btnCopy');
        copyBtn.textContent = dict[currentLang].btnCopy;
        copyBtn.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(shortUrlFor(item.key));
            showToast(dict[currentLang].msgCopied + shortUrlFor(item.key));
          } catch (e) {
            showToast(dict[currentLang].msgFailed, true);
          }
        });

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "action-btn danger";
        delBtn.setAttribute('data-i18n', 'btnDelete');
        delBtn.textContent = dict[currentLang].btnDelete;
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
          btn.textContent = dict[currentLang].btnDelete;
          btn.classList.remove("confirm");
          deleteConfirmState.delete(key);
        }, 3000);
      }
    }

    async function createShortUrl(event) {
      event.preventDefault();
      const url = els.longURL.value.trim();
      const key = els.keyPhrase.value.trim();
      if (!url) {
        showToast(dict[currentLang].msgUrlRequired, true);
        return;
      }

      els.addBtn.disabled = true;
      const originalText = els.addBtn.textContent;
      els.addBtn.textContent = dict[currentLang].creatingBtn;
      setResult(dict[currentLang].msgCreating);

      try {
        const data = await apiRequest({ cmd: "add", url, key });
        saveLocal(data.key, url);
        renderLocal();
        showToast(dict[currentLang].msgCreated + shortUrlFor(data.key));
        setResult(dict[currentLang].msgCreated + shortUrlFor(data.key), "success");
        els.longURL.value = "";
        els.keyPhrase.value = "";
      } catch (error) {
        showToast(error.message, true);
        setResult(error.message, "error");
      } finally {
        els.addBtn.disabled = false;
        els.addBtn.textContent = originalText;
      }
    }

    async function loadKV() {
      const originalText = els.loadKVBtn.textContent;
      els.loadKVBtn.textContent = dict[currentLang].syncingBtn;
      els.loadKVBtn.disabled = true;
      setResult(dict[currentLang].msgSyncing);

      try {
        const data = await apiRequest({ cmd: "qryall" });
        localStorage.clear();
        for (const item of data.kvlist) {
          saveLocal(item.key, item.value);
        }
        renderLocal();
        showToast(dict[currentLang].msgSynced(data.kvlist.length));
        setResult(dict[currentLang].msgSynced(data.kvlist.length), "success");
      } catch (error) {
        showToast(error.message, true);
        setResult(error.message, "error");
      } finally {
        els.loadKVBtn.disabled = false;
        els.loadKVBtn.textContent = originalText;
      }
    }

    async function deleteRecord(key) {
      try {
        await apiRequest({ cmd: "del", key });
        removeLocal(key);
        renderLocal();
        showToast(dict[currentLang].msgDeleted + key);
        setResult(dict[currentLang].msgDeleted + key, "success");
      } catch (error) {
        showToast(error.message, true);
        setResult(error.message, "error");
      }
    }

    els.form.addEventListener("submit", createShortUrl);
    els.loadKVBtn.addEventListener("click", loadKV);
    els.clearLocalBtn.addEventListener("click", () => {
      if (!confirm("Clear all local cache?")) return;
      localStorage.clear();
      renderLocal();
      showToast(dict[currentLang].msgCleared);
      setResult(dict[currentLang].msgCleared, "success");
    });
    els.searchBox.addEventListener("input", (e) => {
      filterLinks(e.target.value);
    });
    els.langToggleBtn.addEventListener("click", () => {
      currentLang = currentLang === 'en' ? 'zh' : 'en';
      updateI18n();
      renderLocal();
    });

    updateI18n();
    if (localItems().length === 0) {
      loadKV();
    } else {
      renderLocal();
    }
  </script>
</body>
</html>`


export async function onRequestGet({ request, env, params }) {
  const key = decodeURIComponent(params.key || "")

  if (!env.LINKS) {
    return new Response("Missing KV binding LINKS.", { status: 500 })
  }

  const password = await getSystemPassword(env)
  if (password && constantTimeCompare(key, password)) {
    const adminHtml = adminHtmlTemplate
      .replace(/__PASSWORD__/gm, password)
      .replace(/__API_BASE__/gm, new URL(request.url).origin + "/api")

    return new Response(adminHtml, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    })
  }

  if (PROTECTED_KEYS.includes(key)) {
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
