#!/usr/bin/env node
/**
 * Import Anthropic Product Management Plugin skills into map-design.
 * Source: .cursor/_vendor/knowledge-work-plugins/product-management/skills/
 * Run: node .cursor/skills/scripts/sync-pm-skills.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const skillsRoot = join(__dirname, '..')
const vendorRoot = join(skillsRoot, '..', '_vendor', 'knowledge-work-plugins', 'product-management', 'skills')

const MAP_CTX = `
## map-design 上下文

规格与路线图须符合本 monorepo 约束。先读 [\`map-design-product.md\`](../saas-product/references/map-design-product.md)。

| 维度 | 说明 |
| --- | --- |
| 活跃 App | \`@repo/saas-web\` — 地图工作台 \`/\` |
| 占位 App | marketing、admin |
| 认证 | RuoYi 过渡 + \`@repo/auth\`（见 \`docs/architecture/auth-rbac.md\`） |
| 工作台 UI | 侧栏 / Dock / 快捷工具条 — \`docs/architecture/map-workspace-ui.md\` |
| 插件 | map-plugin-bridge、\`cloud/uav\` ESM |
| UI 组件 | shadcn 优先，唯一实例 \`packages/ui\` |

**产出**：PRD、研究合成、路线图等写入 \`docs/product/\`（按 \`YYYY-MM-slug.md\` 命名）。  
**工程落地**：规格定稿后改用 \`/saas-fsd-feature\`、\`/map-workspace-ui\`、\`/repo-ui-package\` 等实现 Skill。

> 本仓库未配置 Anthropic PM 插件的 MCP 连接器；上下文来自用户输入与 \`docs/\`、代码库，勿要求连接 Linear/Slack。
`.trim()

const SKILL_META = {
  'write-spec': {
    dir: 'pm-write-spec',
    slash: 'pm-write-spec',
    description: `Write feature specs and PRDs for map-design SaaS (map workspace, RuoYi auth, three-app monorepo). Use this skill whenever the user asks for PRD, 需求文档, 功能规格, user stories, acceptance criteria, MoSCoW scope, or turns a vague feature idea into a structured spec for apps/web—even if they do not say "PRD".`,
  },
  'roadmap-update': {
    dir: 'pm-roadmap-update',
    slash: 'pm-roadmap-update',
    description: `Create or reprioritize product roadmaps for map-design. Use when the user asks for 路线图, Now/Next/Later, quarterly themes, RICE/MoSCoW/ICE prioritization, OKR alignment, dependency mapping, or shifting timelines for Web workbench, Admin, or Marketing apps.`,
  },
  'stakeholder-update': {
    dir: 'pm-stakeholder-update',
    slash: 'pm-stakeholder-update',
    description: `Draft stakeholder updates for map-design product work. Use when the user needs 周报, 月报, executive summary, engineering sync, launch comms, ROAM risks, or ADRs for SaaS map workspace initiatives—tailored to exec, engineering, or customer audiences.`,
  },
  'synthesize-research': {
    dir: 'pm-synthesize-research',
    slash: 'pm-synthesize-research',
    description: `Synthesize user research for map-design. Use when the user provides interview notes, survey data, support themes, or asks for 用户研究, persona, affinity mapping, thematic analysis, or opportunity sizing for the map workspace or tenant users.`,
  },
  'competitive-brief': {
    dir: 'pm-competitive-brief',
    slash: 'pm-competitive-brief',
    description: `Build competitive analysis briefs for map-design and geospatial SaaS context. Use when the user asks for 竞品分析, feature comparison matrix, positioning, win/loss, or strategic implications versus map/GIS or field-ops products.`,
  },
  'metrics-review': {
    dir: 'pm-metrics-review',
    slash: 'pm-metrics-review',
    description: `Review product metrics and OKRs for map-design. Use when the user asks for 指标复盘, North Star, funnel analysis, dashboard requirements, experiment readouts, or goal setting for workspace adoption, auth, or plugin usage.`,
  },
  'product-brainstorming': {
    dir: 'pm-product-brainstorming',
    slash: 'pm-product-brainstorming',
    description: `Brainstorm product ideas for map-design with PM frameworks (JTBD, HMW, opportunity trees). Use when the user wants 头脑风暴, problem exploration, assumption testing, strategy sparring, or early ideation before writing a PRD for the map workspace.`,
  },
  'sprint-planning': {
    dir: 'pm-sprint-planning',
    slash: 'pm-sprint-planning',
    description: `Plan engineering sprints for map-design frontend work. Use when the user asks for 迭代计划, sprint goal, capacity planning, backlog scoping for saas-web, or P0 vs stretch items with Definition of Done aligned to pnpm validate.`,
  },
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('invalid frontmatter')
  return { body: match[2] }
}

const UPSTREAM_SLASH = {
  'write-spec': '/write-spec',
  'roadmap-update': '/roadmap-update',
  'stakeholder-update': '/stakeholder-update',
  'synthesize-research': '/synthesize-research',
  'competitive-brief': '/competitive-brief',
  'metrics-review': '/metrics-review',
  'product-brainstorming': '/brainstorm',
  'sprint-planning': '/sprint-planning',
}

function adaptBody(body, vendorName, slash) {
  let out = body
  out = out.replace(
    /> If you see unfamiliar placeholders or need to check which tools are connected, see \[CONNECTORS\.md\]\([^)]+\)\.\n\n/g,
    '',
  )
  out = out.replace(/If \*\*~~project tracker\*\* is connected:/g, 'If a project tracker is available (optional):')
  out = out.replace(/If \*\*~~knowledge base\*\* is connected:/g, 'If internal docs are available:')
  out = out.replace(/If \*\*~~design\*\* is connected:/g, 'If Figma or design files are available:')
  out = out.replace(/If \*\*~~chat\*\* is connected:/g, 'If team chat context is available:')
  out = out.replace(/If \*\*~~analytics\*\* is connected:/g, 'If product analytics are available:')
  out = out.replace(/If \*\*~~user feedback\*\* is connected:/g, 'If support or feedback data is available:')
  out = out.replace(/If \*\*~~meeting transcription\*\* is connected:/g, 'If meeting notes are available:')
  out = out.replace(/If no project management tool is connected:/g, 'When no tracker is linked:')
  out = out.replace(/If these tools are not connected, work entirely from what the user provides\. Do not ask the user to connect tools — just proceed with available information\./g,
    'Default: use user input plus `docs/` and codebase search. Do not ask to connect external MCP tools.',
  )
  const upstream = UPSTREAM_SLASH[vendorName]
  if (upstream) {
    out = out.replaceAll(upstream, `/${slash}`)
  }

  const firstHeading = out.match(/^# .+\n/m)
  if (firstHeading) {
    const idx = out.indexOf(firstHeading[0]) + firstHeading[0].length
    out = `${out.slice(0, idx)}\n\n${MAP_CTX}\n${out.slice(idx)}`
  }
  return out
}

function syncOne(vendorName, meta) {
  const src = join(vendorRoot, vendorName, 'SKILL.md')
  if (!existsSync(src)) {
    console.error(`SKIP  missing vendor skill: ${vendorName}`)
    return false
  }
  const raw = readFileSync(src, 'utf8').replace(/\r\n/g, '\n')
  const { body } = parseFrontmatter(raw)
  const adapted = adaptBody(body, vendorName, meta.slash)
  const outDir = join(skillsRoot, meta.dir)
  mkdirSync(outDir, { recursive: true })
  const frontmatter = `---
name: ${meta.dir}
description: >-
  ${meta.description}
license: Apache-2.0
---

`
  writeFileSync(join(outDir, 'SKILL.md'), frontmatter + adapted, 'utf8')
  console.log(`OK    ${meta.dir}  ←  ${vendorName}`)
  return true
}

if (!existsSync(vendorRoot)) {
  console.error(`Vendor skills not found: ${vendorRoot}`)
  console.error('Run: git sparse-checkout clone knowledge-work-plugins product-management into .cursor/_vendor/')
  process.exit(1)
}

let ok = 0
for (const [vendorName, meta] of Object.entries(SKILL_META)) {
  if (syncOne(vendorName, meta)) ok++
}
console.log(`---\nSynced ${ok}/${Object.keys(SKILL_META).length} PM skills`)
