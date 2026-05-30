const config = {
  snapchat_mode: false,
}

const protect_keylist = ["api", "password"]
const keyPattern = /^[A-Za-z0-9_-]{1,64}$/

const html404 = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>404 Not Found</title></head>
<body><h1>404 Not Found.</h1><p>The url you visit is not found.</p></body>
</html>`

export async function onRequestGet(context) {
  const { request, env, params } = context
  const key = decodeURIComponent(params.key || "")

  if (!keyPattern.test(key) || protect_keylist.includes(key)) {
    return new Response(html404, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    })
  }

  if (!env.LINKS) {
    return new Response("Missing KV binding LINKS.", { status: 500 })
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
