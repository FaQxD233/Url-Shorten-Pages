const config = {
  snapchat_mode: false,
}

const protect_keylist = ["api", "password"]

const html404 = `<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>404 Not Found</title></head>
<body><h1>404 Not Found.</h1><p>The url you visit is not found.</p></body>
</html>`

const adminHtmlTemplate = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Url Shorten Pages</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #eef2f7;
      --card: #ffffff;
      --text: #172033;
      --muted: #64748b;
      --line: #d7deea;
      --primary: #2563eb;
      --danger: #dc2626;
      --soft: #f8fafc;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f172a;
        --card: #172033;
        --text: #e2e8f0;
        --muted: #94a3b8;
        --line: #2b3850;
        --soft: #111827;
      }
    }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--text); background: var(--bg); }
    main { width: min(980px, calc(100vw - 28px)); margin: 0 auto; padding: 28px 0; }
    h1 { margin: 0 0 18px; font-size: 32px; }
    h2 { margin: 0 0 14px; font-size: 18px; }
    .grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 420px); gap: 18px; align-items: start; }
    .card { border: 1px solid var(--line); border-radius: 16px; padding: 18px; background: var(--card); box-shadow: 0 12px 32px rgba(15, 23, 42, .08); }
    .stack { display: grid; gap: 12px; }
    label { display: grid; gap: 6px; color: var(--muted); font-size: 13px; }
    input, textarea { width: 100%; border: 1px solid var(--line); border-radius: 10px; padding: 10px 11px; color: var(--text); background: var(--soft); font: inherit; }
    textarea { min-height: 108px; resize: vertical; }
    button { border: 0; border-radius: 10px; padding: 10px 12px; color: #fff; background: var(--primary); font: inherit; font-weight: 650; cursor: pointer; }
    button.secondary { color: var(--text); background: var(--line); }
    button.danger { background: var(--danger); }
    .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .status { min-height: 42px; padding: 10px 11px; border: 1px solid var(--line); border-radius: 10px; background: var(--soft); color: var(--muted); overflow-wrap: anywhere; }
    .item { display: grid; gap: 9px; padding: 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--soft); }
    .item a, .item code { overflow-wrap: anywhere; }
    .item code { color: var(--muted); }
    .list { display: grid; gap: 10px; }
    .empty { color: var(--muted); }
    @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>Url Shorten Pages</h1>
    <section class="grid">
      <form class="card stack" id="shortenForm">
        <h2>创建 / 覆盖本地记录</h2>
        <label>
          长链接
          <textarea id="longURL" placeholder="https://example.com/" required></textarea>
        </label>
        <label>
          短链接 Key，可留空自动生成
          <input id="keyPhrase" type="text" maxlength="64" placeholder="my-link">
        </label>
        <div class="row">
          <button id="addBtn" type="submit">创建短链</button>
          <button class="secondary" id="loadKVBtn" type="button">load localStorage from KV</button>
          <button class="secondary" id="loadLocalBtn" type="button">load localStorage</button>
          <button class="danger" id="clearLocalBtn" type="button">clear localStorage</button>
        </div>
      </form>

      <section class="card stack">
        <h2>结果</h2>
        <div class="status" id="result">等待操作</div>
      </section>
    </section>

    <section class="card stack" style="margin-top: 18px;">
      <h2>短链列表</h2>
      <div class="list" id="urlList"></div>
    </section>
  </main>

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
      loadLocalBtn: document.querySelector("#loadLocalBtn"),
      clearLocalBtn: document.querySelector("#clearLocalBtn"),
      result: document.querySelector("#result"),
      urlList: document.querySelector("#urlList"),
    };

    function setResult(text) {
      els.result.textContent = text;
    }

    async function apiRequest(payload) {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, password }),
      });
      const data = await response.json();
      if (data.status != 200) throw new Error(data.error || "请求失败");
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

    function renderLocal() {
      const items = localItems();
      els.urlList.textContent = "";
      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "localStorage 里暂无记录。";
        els.urlList.append(empty);
        return;
      }

      for (const item of items) {
        const node = document.createElement("div");
        node.className = "item";

        const link = document.createElement("a");
        link.href = shortUrlFor(item.key);
        link.textContent = shortUrlFor(item.key);
        link.target = "_blank";

        const value = document.createElement("code");
        value.textContent = item.value;

        const actions = document.createElement("div");
        actions.className = "row";

        const fillBtn = document.createElement("button");
        fillBtn.type = "button";
        fillBtn.className = "secondary";
        fillBtn.textContent = "填入表单";
        fillBtn.addEventListener("click", () => {
          els.keyPhrase.value = item.key;
          els.longURL.value = item.value;
        });

        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "secondary";
        copyBtn.textContent = "复制短链";
        copyBtn.addEventListener("click", async () => {
          await navigator.clipboard.writeText(shortUrlFor(item.key));
          setResult("已复制: " + shortUrlFor(item.key));
        });

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "danger";
        delBtn.textContent = "删除 KV 记录";
        delBtn.addEventListener("click", () => deleteRecord(item.key));

        actions.append(fillBtn, copyBtn, delBtn);
        node.append(link, value, actions);
        els.urlList.append(node);
      }
    }

    async function createShortUrl(event) {
      event.preventDefault();
      const url = els.longURL.value.trim();
      const key = els.keyPhrase.value.trim().replace(/\s/g, "-");
      if (!url) return setResult("长链接不能为空");

      els.addBtn.disabled = true;
      try {
        const data = await apiRequest({ cmd: "add", url, key });
        saveLocal(data.key, url);
        renderLocal();
        setResult("创建成功: " + shortUrlFor(data.key));
      } catch (error) {
        setResult(error.message);
      } finally {
        els.addBtn.disabled = false;
      }
    }

    async function loadKV() {
      try {
        const data = await apiRequest({ cmd: "qryall" });
        localStorage.clear();
        for (const item of data.kvlist) {
          saveLocal(item.key, item.value);
        }
        renderLocal();
        setResult("已从 KV 加载 " + data.kvlist.length + " 条记录到 localStorage");
      } catch (error) {
        setResult(error.message);
      }
    }

    async function deleteRecord(key) {
      if (!confirm("确定删除 KV 记录 " + key + " ?")) return;
      try {
        await apiRequest({ cmd: "del", key });
        removeLocal(key);
        renderLocal();
        setResult("已删除: " + key);
      } catch (error) {
        setResult(error.message);
      }
    }

    els.form.addEventListener("submit", createShortUrl);
    els.loadKVBtn.addEventListener("click", loadKV);
    els.loadLocalBtn.addEventListener("click", () => {
      renderLocal();
      setResult("已加载 localStorage");
    });
    els.clearLocalBtn.addEventListener("click", () => {
      localStorage.clear();
      renderLocal();
      setResult("已清空 localStorage");
    });

    renderLocal();
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
    return new Response(html404, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    })
  }

  let value = await env.LINKS.get(key)
  if (!value) {
    return new Response(html404, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
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
