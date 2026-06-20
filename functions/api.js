import { constantTimeCompare, getSystemPassword, PROTECTED_KEYS, KEY_PATTERN } from './_shared.js'

const config = {
  custom_link: true,
  overwrite_kv: false,
  unique_link: false,
  load_kv: true,
  system_type: "shorturl",
}

const jsonHeaders = {
  "Content-Type": "application/json; charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  })
}


function checkURL(value) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch (error) {
    return false
  }
}

function validateKey(key) {
  if (!key) {
    return "Error: Key required."
  }
  if (!KEY_PATTERN.test(key)) {
    return "Error: Key only supports 1-64 letters, numbers, underscores, and hyphens."
  }
  if (PROTECTED_KEYS.includes(key)) {
    return "Error: Key in protect_keylist."
  }
  return ""
}

function validateStoredKey(key) {
  if (!key) {
    return "Error: Key required."
  }
  if (PROTECTED_KEYS.includes(key)) {
    return "Error: Key in protect_keylist."
  }
  return ""
}

async function randomString(len = 6) {
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
  const values = new Uint32Array(len)
  crypto.getRandomValues(values)
  let result = ""
  for (let i = 0; i < len; i++) {
    result += chars.charAt(values[i] % chars.length)
  }
  return result
}

async function sha512(value) {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest({ name: "SHA-512" }, data)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function saveUrl(env, url) {
  for (let i = 0; i < 10; i++) {
    const key = await randomString()
    const existed = await env.LINKS.get(key)
    if (existed == null) {
      await env.LINKS.put(key, url)
      return key
    }
  }
  throw new Error("Failed to generate a unique key.")
}

export async function onRequestOptions() {
  return new Response("", { headers: jsonHeaders })
}

export async function onRequestPost({ request, env }) {
  if (!env.LINKS) {
    return jsonResponse({ status: 500, error: "Error: Missing KV binding LINKS." }, 500)
  }

  let req
  try {
    req = await request.json()
  } catch (error) {
    return jsonResponse({ status: 500, error: "Error: Invalid JSON." }, 500)
  }

  const password = await getSystemPassword(env)
  if (!constantTimeCompare(req.password, password)) {
    return jsonResponse({ status: 401, error: "Error: Invalid password." }, 401)
  }

  const req_cmd = req.cmd
  const req_url = req.url || ""
  const req_key = req.key || ""

  if (req_cmd === "add") {
    if (config.system_type === "shorturl" && !checkURL(req_url)) {
      return jsonResponse({ status: 500, url: req_url, error: "Error: Url illegal." }, 500)
    }

    let key
    if (config.custom_link && req_key !== "") {
      const keyError = validateKey(req_key)
      if (keyError) {
        return jsonResponse({ status: 500, key: req_key, error: keyError }, 500)
      }

      const existed = await env.LINKS.get(req_key)
      if (!config.overwrite_kv && existed) {
        return jsonResponse({ status: 500, key: req_key, error: "Error: Specific key existed." }, 500)
      }

      key = req_key
      await env.LINKS.put(req_key, req_url)
    } else if (config.unique_link) {
      const url_sha512 = await sha512(req_url)
      const existedKey = await env.LINKS.get(url_sha512)
      if (existedKey) {
        key = existedKey
      } else {
        key = await saveUrl(env, req_url)
        await env.LINKS.put(url_sha512, key)
      }
    } else {
      key = await saveUrl(env, req_url)
    }

    return jsonResponse({ status: 200, key, error: "" })
  }

  if (req_cmd === "del") {
    const keyError = validateStoredKey(req_key)
    if (keyError) {
      return jsonResponse({ status: 500, key: req_key, error: keyError }, 500)
    }

    await env.LINKS.delete(req_key)
    return jsonResponse({ status: 200, key: req_key, error: "" })
  }

  if (req_cmd === "qry") {
    const keyError = validateStoredKey(req_key)
    if (keyError) {
      return jsonResponse({ status: 500, key: req_key, error: keyError }, 500)
    }

    const value = await env.LINKS.get(req_key)
    if (value == null) {
      return jsonResponse({ status: 500, key: req_key, error: "Error: Key not exist." }, 500)
    }
    return jsonResponse({ status: 200, error: "", key: req_key, url: value })
  }

  if (req_cmd === "qryall") {
    if (!config.load_kv) {
      return jsonResponse({ status: 500, error: "Error: Config.load_kv false." }, 500)
    }

    const result = { status: 200, error: "", kvlist: [] }
    let cursor
    do {
      const page = cursor ? await env.LINKS.list({ cursor }) : await env.LINKS.list()
      cursor = page.cursor
      const keys = page.keys.filter((item) => !PROTECTED_KEYS.includes(item.name))
      const values = await Promise.all(keys.map((item) => env.LINKS.get(item.name)))
      for (let i = 0; i < keys.length; i++) {
        result.kvlist.push({ key: keys[i].name, value: values[i] })
      }
    } while (cursor)

    return jsonResponse(result)
  }

  return jsonResponse({ status: 500, error: "Error: Unknown command." }, 500)
}
