#!/usr/bin/env node
/**
 * Validate map-design Cursor Skills against agentskills.io + skill-creator quick_validate rules.
 * Usage: node .cursor/skills/scripts/validate-skills.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const skillsRoot = join(__dirname, '..')

const ALLOWED_KEYS = new Set([
  'name',
  'description',
  'license',
  'allowed-tools',
  'metadata',
  'compatibility',
])

const NAME_RE = /^[a-z0-9-]+$/

function parseFrontmatter(content) {
  if (!content.startsWith('---')) {
    throw new Error('missing YAML frontmatter')
  }
  const end = content.indexOf('\n---', 4)
  if (end === -1) throw new Error('unclosed frontmatter')
  const raw = content.slice(4, end)
  const body = content.slice(end + 4).replace(/^\n/, '')
  const fm = {}
  let key = null
  let valueLines = []
  const flush = () => {
    if (!key) return
    const joined = valueLines.join('\n').trim()
    if (joined.includes('\n')) {
      fm[key] = joined
    } else if (joined === '>-' || joined === '|') {
      fm[key] = ''
    } else {
      fm[key] = joined.replace(/^["']|["']$/g, '')
    }
    key = null
    valueLines = []
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^([a-zA-Z0-9-]+):\s*(.*)$/)
    if (m && !line.startsWith(' ')) {
      flush()
      key = m[1]
      const rest = m[2]
      if (rest === '>-' || rest === '|' || rest === '') {
        valueLines = rest === '>-' || rest === '|' ? [] : ['']
      } else {
        valueLines = [rest]
      }
    } else if (key) {
      valueLines.push(line.startsWith('  ') ? line.slice(2) : line)
    }
  }
  flush()
  // Folded block scalar (>-)
  for (const [k, v] of Object.entries(fm)) {
    if (typeof v === 'string' && v.includes('\n')) {
      fm[k] = v.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    }
  }
  return { fm, body, lineCount: content.split('\n').length }
}

function parseFrontmatterRobust(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) throw new Error('invalid frontmatter')
  const block = match[1]
  const fm = { _keys: [] }

  const lines = block.split('\n')
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const kv = line.match(/^([a-zA-Z0-9-]+):\s*(.*)$/)
    if (!kv) {
      i++
      continue
    }
    const key = kv[1]
    const rest = kv[2]
    fm._keys.push(key)

    if (rest === '>-' || rest === '|' || rest === '') {
      const parts = []
      i++
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i] === '')) {
        if (lines[i].startsWith('  ')) parts.push(lines[i].slice(2))
        i++
      }
      fm[key] = parts.join(' ').replace(/\s+/g, ' ').trim()
      continue
    }

    fm[key] = rest.trim()
    i++
  }

  return {
    fm,
    lineCount: content.split('\n').length,
  }
}

function validateSkill(skillDir) {
  const skillMd = join(skillDir, 'SKILL.md')
  const dirName = skillDir.split(/[/\\]/).pop()
  const errors = []
  const warnings = []

  let content
  try {
    content = readFileSync(skillMd, 'utf8').replace(/\r\n/g, '\n')
  } catch {
    return { dirName, ok: false, errors: ['SKILL.md not found'], warnings: [] }
  }

  let fm
  let lineCount
  try {
    const parsed = parseFrontmatterRobust(content)
    fm = parsed.fm
    lineCount = parsed.lineCount
  } catch (e) {
    return { dirName, ok: false, errors: [e.message], warnings: [] }
  }

  const keys = fm._keys ?? []
  for (const k of keys) {
    if (!ALLOWED_KEYS.has(k)) errors.push(`unexpected frontmatter key: ${k}`)
  }
  if (!fm.name) errors.push("missing 'name'")
  if (!fm.description) errors.push("missing 'description'")
  if (fm.name && fm.name !== dirName) {
    errors.push(`name '${fm.name}' must match directory '${dirName}' (agentskills.io)`)
  }
  if (fm.name && !NAME_RE.test(fm.name)) errors.push(`name '${fm.name}' not kebab-case`)
  if (fm.name && (fm.name.startsWith('-') || fm.name.endsWith('-') || fm.name.includes('--'))) {
    errors.push(`invalid name hyphens: ${fm.name}`)
  }
  if (fm.name && fm.name.length > 64) errors.push('name exceeds 64 chars')
  if (fm.description && fm.description.length > 1024) {
    errors.push(`description too long (${fm.description.length})`)
  }
  if (fm.description && (fm.description.includes('<') || fm.description.includes('>'))) {
    errors.push('description must not contain angle brackets')
  }
  if (fm.compatibility && fm.compatibility.length > 500) errors.push('compatibility too long')
  if (lineCount > 500) warnings.push(`SKILL.md is ${lineCount} lines (recommended <500)`)

  const desc = fm.description ?? ''
  if (desc && desc.length < 120) warnings.push('description may be too short for reliable triggering (<120 chars)')
  const trigger = desc.toLowerCase()
  if (
    !trigger.includes('use when') &&
    !trigger.includes('whenever') &&
    !trigger.includes('use this skill')
  ) {
    warnings.push('description lacks explicit trigger phrasing (Use when / whenever / Use this skill)')
  }

  return { dirName, ok: errors.length === 0, errors, warnings, lineCount, descLen: desc.length }
}

const dirs = readdirSync(skillsRoot)
  .map((name) => join(skillsRoot, name))
  .filter((p) => {
    try {
      return statSync(p).isDirectory() && statSync(join(p, 'SKILL.md')).isFile()
    } catch {
      return false
    }
  })

const results = dirs.map(validateSkill).sort((a, b) => a.dirName.localeCompare(b.dirName))

let pass = 0
let fail = 0
for (const r of results) {
  const status = r.ok ? 'PASS' : 'FAIL'
  if (r.ok) pass++
  else fail++
  console.log(`${status}  ${r.dirName.padEnd(28)} lines=${String(r.lineCount).padStart(3)}  desc=${String(r.descLen).padStart(4)}`)
  for (const e of r.errors) console.log(`       ✗ ${e}`)
  for (const w of r.warnings) console.log(`       ⚠ ${w}`)
}

console.log('---')
console.log(`Skills: ${results.length}  Pass: ${pass}  Fail: ${fail}`)
process.exit(fail > 0 ? 1 : 0)
