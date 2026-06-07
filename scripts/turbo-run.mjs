#!/usr/bin/env node
/**
 * 尝试运行 Turborepo；若 Windows 原生二进制无法启动（缺 VC++ 运行库等），
 * 自动降级为等价的 pnpm 命令。
 */
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const turboBin = require.resolve('turbo/bin/turbo')
const args = process.argv.slice(2)

function runTurbo() {
  return spawnSync(process.execPath, [turboBin, ...args], { stdio: 'inherit' })
}

function turboCrashed(result) {
  return (
    result.error != null ||
    result.signal != null ||
    result.status === 3221225781 ||
    result.status === -1073741515
  )
}

function runPnpm(pnpmArgs) {
  const result = spawnSync('pnpm', pnpmArgs, { stdio: 'inherit', shell: true })
  process.exit(result.status ?? 1)
}

const turboResult = runTurbo()
if (!turboCrashed(turboResult)) {
  process.exit(turboResult.status ?? 0)
}

console.warn('')
console.warn('⚠ Turborepo 原生二进制无法启动（Windows 常见原因：缺少 Visual C++ Redistributable x64）')
console.warn('  安装地址: https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist')
console.warn('  已自动改用 pnpm 后备命令继续执行…')
console.warn('')

if (args[0] !== 'run' || args[1] == null) {
  console.error('后备方案仅支持: turbo run <task> [--filter=...]')
  process.exit(1)
}

const task = args[1]
const filter = args.find((a) => a.startsWith('--filter='))?.slice('--filter='.length)

const pnpmArgs = filter
  ? ['--filter', filter, 'run', task]
  : ['-r', 'run', task]

runPnpm(pnpmArgs)
