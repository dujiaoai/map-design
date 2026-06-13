#!/usr/bin/env node
/**
 * SaaS Auth 端到端冒烟（直连 Java :8082/v1，不依赖前端）。
 *
 * Usage:
 *   node services/saas-api/scripts/smoke-auth.mjs
 *   SAAS_API_BASE_URL=http://localhost:8082/v1 node services/saas-api/scripts/smoke-auth.mjs
 *
 * 注册确认 / 邀请接受：设置 SMOKE_REGISTER_TOKEN，或 SMOKE_PG_CONTAINER（默认 services-postgres-1）
 * 从 sys_email_outbox 读取 verifyUrl / inviteUrl 中的 token。
 */

import { execSync } from 'node:child_process'

const baseUrl = (process.env.SAAS_API_BASE_URL ?? 'http://localhost:8082/v1').replace(/\/$/, '')
const apiRoot = baseUrl.replace(/\/v1$/, '') || baseUrl

const credentials = {
  email: process.env.SMOKE_EMAIL ?? 'admin@demo.local',
  password: process.env.SMOKE_PASSWORD ?? 'password',
  tenantId: process.env.SMOKE_TENANT ?? 'demo',
}

const adminCredentials = {
  email: process.env.SMOKE_ADMIN_EMAIL ?? credentials.email,
  password: process.env.SMOKE_ADMIN_PASSWORD ?? credentials.password,
  tenantId: credentials.tenantId,
}

const demoTenantId = process.env.SMOKE_TENANT_UUID ?? '11111111-1111-1111-1111-111111111101'

function extractTokenFromPayload(payloadJson) {
  const payload = JSON.parse(payloadJson)
  const url = payload.verifyUrl ?? payload.inviteUrl
  if (!url || typeof url !== 'string') {
    return null
  }
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : ''
  for (const part of query.split('&')) {
    const [key, value] = part.split('=')
    if (key === 'token' && value) {
      return decodeURIComponent(value)
    }
  }
  return null
}

function loadOutboxToken(email, template) {
  const container = process.env.SMOKE_PG_CONTAINER?.trim() || 'services-postgres-1'
  const safeEmail = email.replace(/'/g, "''")
  const sql =
    `SELECT payload_json FROM sys_email_outbox WHERE to_email='${safeEmail}'` +
    ` AND template='${template}' ORDER BY created_at DESC LIMIT 1`
  try {
    const out = execSync(`docker exec ${container} psql -U saas -d saas -t -A -c "${sql}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return out ? extractTokenFromPayload(out) : null
  } catch {
    return null
  }
}

function resolveRegisterToken(registerEmail) {
  const manual = process.env.SMOKE_REGISTER_TOKEN?.trim()
  if (manual) {
    return manual
  }
  return loadOutboxToken(registerEmail, 'register-verification')
}

async function runRegisterConfirmFlow(registerEmail, verifyToken, passed) {
  const confirm = await api('/auth/register/confirm', {
    method: 'POST',
    body: { token: verifyToken },
  })
  if (!confirm.ok) {
    fail('register-confirm', `HTTP ${confirm.status} ${JSON.stringify(confirm.body)}`)
  }
  if (!confirm.body?.accessToken || confirm.body?.user?.roles?.includes('MEMBER') !== true) {
    fail('register-confirm', 'missing tokens or MEMBER role')
  }
  passed.push('register-confirm')

  const newPassword = 'newpass99'
  const changePwd = await api('/users/me/password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${confirm.body.accessToken}` },
    body: { oldPassword: credentials.password, newPassword },
  })
  if (changePwd.status !== 204) {
    fail('users/me-password', `expected 204, got HTTP ${changePwd.status}`)
  }
  passed.push('users/me-password')

  const loginNewPwd = await api('/auth/login', {
    method: 'POST',
    body: { email: registerEmail, password: newPassword, tenantId: credentials.tenantId },
  })
  if (!loginNewPwd.ok) fail('login-after-password', `HTTP ${loginNewPwd.status}`)
  passed.push('login-after-password')
}

async function runInviteAcceptFlow(passed) {
  const adminLogin = await api('/auth/login', { method: 'POST', body: adminCredentials })
  if (!adminLogin.ok) {
    console.log('hint: 跳过 invite 流程（admin 登录失败，需 PLATFORM_ADMIN 账号）')
    return
  }

  const inviteEmail = `invite-${Date.now()}@demo.local`
  const invitePassword = 'invitepass99'
  const invite = await api('/admin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminLogin.body.accessToken}` },
    body: {
      tenantId: demoTenantId,
      email: inviteEmail,
      roleCode: 'MEMBER',
    },
  })
  if (invite.status !== 201) {
    fail('admin-invite', `HTTP ${invite.status} ${JSON.stringify(invite.body)}`)
  }
  passed.push('admin-invite')

  const inviteToken = loadOutboxToken(inviteEmail, 'member-invite')
  if (!inviteToken) {
    fail(
      'invite-token',
      '无法从 sys_email_outbox 读取 invite token（设置 SMOKE_PG_CONTAINER 或检查 docker postgres）',
    )
  }

  const accept = await api('/auth/accept-invite', {
    method: 'POST',
    body: { token: inviteToken, password: invitePassword },
  })
  if (!accept.ok) {
    fail('accept-invite', `HTTP ${accept.status} ${JSON.stringify(accept.body)}`)
  }
  if (!accept.body?.accessToken || accept.body?.user?.email !== inviteEmail) {
    fail('accept-invite', 'missing tokens or unexpected email')
  }
  passed.push('accept-invite')

  const loginInvited = await api('/auth/login', {
    method: 'POST',
    body: { email: inviteEmail, password: invitePassword, tenantId: credentials.tenantId },
  })
  if (!loginInvited.ok) {
    fail('login-after-invite', `HTTP ${loginInvited.status}`)
  }
  passed.push('login-after-invite')
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
  if (register.status !== 204) {
    fail('register', `HTTP ${register.status} ${JSON.stringify(register.body)}`)
  }
  passed.push('register-request')

  const verifyToken = resolveRegisterToken(registerEmail)
  if (verifyToken) {
    await runRegisterConfirmFlow(registerEmail, verifyToken, passed)
  } else {
    console.log(
      'hint: 设置 SMOKE_REGISTER_TOKEN 或 SMOKE_PG_CONTAINER 可跑完整注册确认与改密步骤',
    )
  }

  if (process.env.SMOKE_SKIP_INVITE !== '1') {
    await runInviteAcceptFlow(passed)
  }

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

  const meAfterLogout = await api('/users/me', {
    headers: { Authorization: `Bearer ${refresh.body.accessToken}` },
  })
  if (meAfterLogout.status !== 401) {
    fail('users/me-after-logout', `expected 401, got HTTP ${meAfterLogout.status}`)
  }
  passed.push('users/me-after-logout')

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
