#!/usr/bin/env node
/**
 * SaaS Auth 端到端冒烟（直连 Java :8082/v1，不依赖前端）。
 *
 * Usage:
 *   node services/saas-api/scripts/smoke-auth.mjs
 *   SAAS_API_BASE_URL=http://localhost:8082/v1 node services/saas-api/scripts/smoke-auth.mjs
 */

const baseUrl = (process.env.SAAS_API_BASE_URL ?? 'http://localhost:8082/v1').replace(/\/$/, '')
const apiRoot = baseUrl.replace(/\/v1$/, '') || baseUrl

const credentials = {
  email: process.env.SMOKE_EMAIL ?? 'admin@demo.local',
  password: process.env.SMOKE_PASSWORD ?? 'password',
  tenantId: process.env.SMOKE_TENANT ?? 'demo',
}

async function parseBody(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  const body = await parseBody(res)
  return { ok: res.ok, status: res.status, body }
}

function fail(step, detail) {
  console.error(`FAIL [${step}]: ${detail}`)
  process.exit(1)
}

async function main() {
  const passed = []

  const healthRes = await fetch(`${apiRoot}/actuator/health`)
  if (!healthRes.ok) fail('health', `HTTP ${healthRes.status}`)
  passed.push('health')

  const registerEmail = `smoke-${Date.now()}@demo.local`
  const register = await api('/auth/register', {
    method: 'POST',
    body: {
      email: registerEmail,
      password: credentials.password,
      tenantId: credentials.tenantId,
      displayName: 'Smoke Register',
    },
  })
  if (!register.ok) fail('register', `HTTP ${register.status} ${JSON.stringify(register.body)}`)
  if (!register.body?.accessToken || register.body?.user?.roles?.includes('MEMBER') !== true) {
    fail('register', 'missing tokens or MEMBER role')
  }
  passed.push('register')

  const login = await api('/auth/login', { method: 'POST', body: credentials })
  if (!login.ok) fail('login', `HTTP ${login.status} ${JSON.stringify(login.body)}`)
  if (!login.body?.accessToken || !login.body?.refreshToken) {
    fail('login', 'missing accessToken or refreshToken')
  }
  passed.push('login')

  const me1 = await api('/users/me', {
    headers: { Authorization: `Bearer ${login.body.accessToken}` },
  })
  if (!me1.ok) fail('users/me', `HTTP ${me1.status}`)
  if (me1.body?.user?.email !== credentials.email) {
    fail('users/me', `unexpected email: ${me1.body?.user?.email}`)
  }
  if (!me1.body?.user?.roles?.length || !me1.body?.tenant?.slug || !me1.body?.expiresAt) {
    fail('users/me', 'missing roles, tenant.slug, or expiresAt')
  }
  passed.push('users/me')

  const updateMe = await api('/users/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${login.body.accessToken}` },
    body: { name: 'Smoke Updated' },
  })
  if (!updateMe.ok) fail('users/me-put', `HTTP ${updateMe.status}`)
  if (updateMe.body?.user?.name !== 'Smoke Updated') {
    fail('users/me-put', `unexpected name: ${updateMe.body?.user?.name}`)
  }
  passed.push('users/me-put')

  const refresh = await api('/auth/refresh', {
    method: 'POST',
    body: { refreshToken: login.body.refreshToken },
  })
  if (!refresh.ok) fail('refresh', `HTTP ${refresh.status} ${JSON.stringify(refresh.body)}`)
  if (!refresh.body?.accessToken) fail('refresh', 'missing accessToken')
  passed.push('refresh')

  const me2 = await api('/users/me', {
    headers: { Authorization: `Bearer ${refresh.body.accessToken}` },
  })
  if (!me2.ok) fail('users/me-after-refresh', `HTTP ${me2.status}`)
  passed.push('users/me-after-refresh')

  const logout = await api('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${refresh.body.accessToken}` },
  })
  if (logout.status !== 204) {
    fail('logout', `expected 204, got HTTP ${logout.status}`)
  }
  passed.push('logout')

  const refreshAfterLogout = await api('/auth/refresh', {
    method: 'POST',
    body: { refreshToken: refresh.body.refreshToken },
  })
  if (refreshAfterLogout.status !== 401) {
    fail('refresh-after-logout', `expected 401, got HTTP ${refreshAfterLogout.status}`)
  }
  passed.push('refresh-after-logout')

  console.log(`PASS (${passed.length} steps): ${passed.join(' → ')}`)
  console.log(`base: ${baseUrl}`)
  console.log(`user: ${me2.body.user.email} roles=${me2.body.user.roles?.join(',')}`)
}

main().catch((err) => {
  console.error('FAIL [unexpected]:', err)
  process.exit(1)
})
