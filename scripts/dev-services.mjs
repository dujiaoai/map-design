#!/usr/bin/env node
/**
 * 本地 Java 后端一键启动：Docker infra（PG/Redis/MailHog）+ billing-api + saas-api
 *
 * 启动前若 Java 端口（8082/8083）被占用，会先结束占用进程再启动。
 *
 * 用法：
 *   pnpm dev:services
 *   node scripts/dev-services.mjs --skip-install   # infra 已就绪、已 install 时跳过 Maven install
 *   node scripts/dev-services.mjs --no-infra         # 仅启动两个 Spring Boot（infra 已在跑）
 *   node scripts/dev-services.mjs --no-free-ports    # 不自动释放端口（冲突时手动处理）
 */
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const composeFile = 'services/docker-compose.dev.yml'
const shell = process.platform === 'win32'

const args = new Set(process.argv.slice(2))
const skipInstall = args.has('--skip-install')
const noInfra = args.has('--no-infra')
const noFreePorts = args.has('--no-free-ports')

/** dev:services Java 服务端口（与 application.yml 一致） */
const JAVA_PORTS = [
  { port: 8082, label: 'saas-api' },
  { port: 8083, label: 'billing-api' },
]

const children = []
let shuttingDown = false

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function findListeningPids(port) {
  if (process.platform === 'win32') {
    const result = spawnSync('netstat', ['-ano'], { encoding: 'utf8', shell })
    if (result.status !== 0) return []
    const portPattern = new RegExp(`:${port}\\s`)
    const pids = new Set()
    for (const line of result.stdout.split(/\r?\n/)) {
      if (!line.includes('LISTENING') || !portPattern.test(line)) continue
      const pid = line.trim().split(/\s+/).at(-1)
      if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid)
    }
    return [...pids]
  }

  const lsof = spawnSync('lsof', ['-ti', `:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' })
  if (lsof.status !== 0 || !lsof.stdout.trim()) return []
  return lsof.stdout.trim().split(/\s+/).filter(Boolean)
}

function killPid(pid) {
  const self = String(process.pid)
  if (pid === self) return false

  if (process.platform === 'win32') {
    const result = spawnSync('taskkill', ['/pid', pid, '/T', '/F'], { shell, stdio: 'ignore' })
    return result.status === 0
  }

  spawnSync('kill', ['-TERM', pid], { stdio: 'ignore' })
  return true
}

function freePort({ port, label }) {
  const pids = findListeningPids(port)
  if (pids.length === 0) return

  console.log(`→ 释放端口 ${port}（${label}）占用进程: ${pids.join(', ')}`)
  for (const pid of pids) {
    if (killPid(pid)) {
      console.log(`  ✓ 已结束 PID ${pid}`)
    } else {
      console.warn(`  ⚠ 无法结束 PID ${pid}，请手动检查`)
    }
  }
}

async function freeServicePorts(entries, { reason } = {}) {
  if (noFreePorts) return
  const occupied = entries.filter(({ port }) => findListeningPids(port).length > 0)
  if (occupied.length === 0) return

  console.log(`\n→ 检测到端口占用${reason ? `（${reason}）` : ''}，先释放再启动…`)
  for (const entry of occupied) {
    freePort(entry)
  }
  await sleep(800)
}

function run(cmd, cmdArgs, { cwd = repoRoot, label } = {}) {
  if (label) console.log(`\n→ ${label}`)
  const result = spawnSync(cmd, cmdArgs, {
    cwd,
    shell,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function composeArgs(extra) {
  return ['compose', '-f', composeFile, ...extra]
}

async function waitForInfra() {
  console.log('\n→ 等待 PostgreSQL / Redis 就绪…')
  for (let attempt = 1; attempt <= 45; attempt++) {
    const pg = spawnSync('docker', composeArgs(['exec', '-T', 'postgres', 'pg_isready', '-U', 'saas', '-d', 'saas']), {
      cwd: repoRoot,
      shell,
      encoding: 'utf8',
    })
    const redis = spawnSync('docker', composeArgs(['exec', '-T', 'redis', 'redis-cli', 'ping']), {
      cwd: repoRoot,
      shell,
      encoding: 'utf8',
    })
    if (pg.status === 0 && redis.stdout?.trim() === 'PONG') {
      console.log('✓ PostgreSQL 与 Redis 已就绪')
      return
    }
    if (attempt === 45) {
      console.error('✗ 依赖服务超时：请检查 docker compose -f services/docker-compose.dev.yml ps')
      process.exit(1)
    }
    await sleep(1000)
  }
}

function prefixStream(name, stream) {
  stream.on('data', (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (line.length > 0) console.log(`[${name}] ${line}`)
    }
  })
}

function spawnService(name, mvnArgs) {
  const child = spawn('mvn', mvnArgs, {
    cwd: repoRoot,
    shell,
    env: process.env,
  })
  prefixStream(name, child.stdout)
  prefixStream(name, child.stderr)
  child.on('exit', (code, signal) => {
    if (shuttingDown) return
    console.error(`\n✗ ${name} 已退出 (code=${code ?? 'null'}, signal=${signal ?? 'null'})`)
    shutdown(code ?? 1)
  })
  children.push(child)
  return child
}

function killChild(child) {
  if (child.killed || child.exitCode != null) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { shell, stdio: 'ignore' })
  } else {
    child.kill('SIGTERM')
  }
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true
  console.log('\n→ 停止 Java 服务…')
  for (const child of children) killChild(child)
  process.exit(exitCode)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

console.log('map-design dev:services')
console.log('  billing-api → http://localhost:8083/actuator/health')
console.log('  saas-api    → http://localhost:8082/actuator/health')
console.log('  MailHog UI  → http://localhost:8025')
console.log('  Ctrl+C 停止 Java 进程（Docker infra 保持运行）')
if (noFreePorts) {
  console.log('  ⚠ --no-free-ports：端口冲突时需手动释放')
}

await freeServicePorts(JAVA_PORTS, { reason: 'Java 服务' })

if (!noInfra) {
  run('docker', composeArgs(['up', '-d']), { label: '启动 Docker infra（postgres / redis / mailhog）' })
  await waitForInfra()
} else {
  console.log('\n→ 跳过 Docker infra（--no-infra）')
}

if (!skipInstall) {
  run(
    'mvn',
    ['-f', 'services/pom.xml', '-pl', 'saas-api,billing-api', '-am', 'install', '-DskipTests', '-q'],
    { label: 'Maven install（billing-core + saas-api + billing-api）' },
  )
} else {
  console.log('\n→ 跳过 Maven install（--skip-install）')
}

console.log('\n→ 启动 billing-api (:8083) 与 saas-api (:8082)…\n')

await freeServicePorts(JAVA_PORTS, { reason: 'Spring Boot 启动前' })

spawnService('billing-api', [
  '-f',
  'services/pom.xml',
  '-pl',
  'billing-api',
  'spring-boot:run',
  '-Dspring-boot.run.profiles=dev',
])

spawnService('saas-api', [
  '-f',
  'services/pom.xml',
  '-pl',
  'saas-api',
  'spring-boot:run',
  '-Dspring-boot.run.profiles=dev',
])
