#!/usr/bin/env node
/**
 * map-design Docker compose 封装：up / smoke / down / ps / logs / rebuild
 * 用法：node .cursor/skills/docker-deploy/scripts/deploy.mjs [command] [--gateway] [--billing-db]
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../..')
const deployDir = path.join(repoRoot, 'deploy')
const envExample = path.join(deployDir, '.env.docker.example')
const envFile = path.join(deployDir, '.env')

function parseEnvFile(filePath) {
  const out = {}
  if (!fs.existsSync(filePath)) return out
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
  return out
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    cwd: deployDir,
    ...opts,
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function curlCheck(url, { method = 'HEAD' } = {}) {
  const bin = process.platform === 'win32' ? 'curl.exe' : 'curl'
  if (method === 'GET') {
    const nullDev = process.platform === 'win32' ? 'NUL' : '/dev/null'
    const result = spawnSync(bin, ['-sS', '-o', nullDev, '-w', '%{http_code}', url], {
      encoding: 'utf8',
      shell: false,
    })
    const status = Number(result.stdout?.trim() || 0)
    return {
      ok: result.status === 0 && status > 0,
      status,
      firstLine: status ? `HTTP/1.1 ${status}` : 'request failed',
    }
  }
  const result = spawnSync(bin, ['-sI', url], { encoding: 'utf8', shell: false })
  const firstLine = (result.stdout || '').split('\n')[0] || ''
  const statusMatch = firstLine.match(/HTTP\/[\d.]+ (\d+)/)
  return {
    ok: result.status === 0,
    status: statusMatch ? Number(statusMatch[1]) : 0,
    firstLine,
  }
}

function ensureEnv() {
  if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile)
    console.log('Created deploy/.env from .env.docker.example')
  }
}

function composeArgs(extra = []) {
  const args = ['compose']
  if (process.argv.includes('--billing-db')) {
    args.push('-f', 'docker-compose.yml', '-f', 'docker-compose.billing-db.yml')
  }
  if (process.argv.includes('--gateway')) {
    args.push('--profile', 'gateway')
  }
  return [...args, ...extra]
}

const command = process.argv[2] || 'up'
const env = parseEnvFile(envFile)

ensureEnv()

switch (command) {
  case 'up': {
    console.log('Building and starting containers in deploy/…')
    run('docker', composeArgs(['up', '-d', '--build']))
    console.log('\nDone. Run smoke test: node .cursor/skills/docker-deploy/scripts/deploy.mjs smoke')
    break
  }
  case 'rebuild': {
    run('docker', composeArgs(['build', '--no-cache', 'saas-api', 'saas-web', 'saas-admin', 'cloud-uav']))
    run('docker', composeArgs(['up', '-d']))
    break
  }
  case 'down': {
    run('docker', composeArgs(['down']))
    break
  }
  case 'ps': {
    run('docker', composeArgs(['ps']))
    break
  }
  case 'logs': {
    run('docker', composeArgs(['logs', '-f']))
    break
  }
  case 'smoke': {
    const webPort = env.SAAS_WEB_PORT || '8084'
    const adminPort = env.SAAS_ADMIN_PORT || '8083'
    const apiPort = env.SAAS_API_PORT || '8082'
    const billingPort = env.BILLING_API_PORT || '8085'
    const uavPort = env.CLOUD_UAV_PORT || '8081'
    const checks = [
      { name: 'saas-web SPA', url: `http://localhost:${webPort}/` },
      { name: 'SaaS /v1 proxy', url: `http://localhost:${webPort}/v1/ping`, method: 'GET' },
      { name: 'saas-api health', url: `http://localhost:${apiPort}/actuator/health` },
      { name: 'billing-api health', url: `http://localhost:${billingPort}/actuator/health` },
      { name: 'saas-admin SPA', url: `http://localhost:${adminPort}/` },
      {
        name: 'saas-admin /v1/admin/ping',
        url: `http://localhost:${adminPort}/v1/admin/ping`,
        method: 'GET',
      },
      { name: 'RuoYi proxy', url: `http://localhost:${webPort}/YunYanApi/captchaImage` },
      { name: 'cloud-uav registry', url: `http://localhost:${uavPort}/yunyan-cloud-uav/assets/registry.js` },
    ]
    let failed = 0
    for (const { name, url, method } of checks) {
      const res = curlCheck(url, { method })
      const pass = res.ok && res.status >= 200 && res.status < 400
      console.log(`${pass ? '✓' : '✗'} ${name}: ${res.firstLine || 'request failed'}`)
      if (!pass) failed++
    }
    process.exit(failed > 0 ? 1 : 0)
    break
  }
  default:
    console.error(`Unknown command: ${command}`)
    console.error('Usage: deploy.mjs [up|smoke|down|ps|logs|rebuild] [--gateway] [--billing-db]')
    process.exit(1)
}
