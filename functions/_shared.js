// 共享工具函数，供 api.js 和 [key].js 使用

/**
 * 恒定时间字符串比较，防止时序攻击
 */
export function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false
  }

  const aLen = a.length
  const bLen = b.length
  const maxLen = Math.max(aLen, bLen)

  let mismatch = aLen !== bLen ? 1 : 0

  for (let i = 0; i < maxLen; i++) {
    const aCode = i < aLen ? a.charCodeAt(i) : 0
    const bCode = i < bLen ? b.charCodeAt(i) : 0
    mismatch |= aCode ^ bCode
  }

  return mismatch === 0
}

/**
 * HTML 转义，防止 XSS
 */
export function escapeHtml(str) {
  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  }
  return String(str).replace(/[&<>"'/]/g, (char) => htmlEntities[char])
}

export const jsonHeaders = {
  "Content-Type": "application/json; charset=UTF-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  })
}

/**
 * 获取系统密码（统一逻辑）
 */
export async function getSystemPassword(env) {
  // 优先级：环境变量 > KV
  if (env.USW_PASSWORD && env.USW_PASSWORD.trim()) {
    return env.USW_PASSWORD.trim()
  }
  return (await env.LINKS.get("password")) || ""
}

/**
 * 保护关键字列表
 */
export const PROTECTED_KEYS = ["api", "password"]

/**
 * Key 验证正则
 */
export const KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/
