---
name: saas-product
description: >-
  Orchestrate product management for map-design SaaS monorepo (Anthropic PM Plugin,
  localized). Use this skill whenever the user asks for PRD, 需求, 路线图, 用户研究,
  竞品, 指标复盘, 干系人汇报, 头脑风暴, or sprint planning for apps/web map workspace—
  even if they do not name a PM framework. Routes to pm-* skills and docs/product/.
---

# SaaS Product（map-design）

基于 [Anthropic Product Management Plugin](https://github.com/anthropics/knowledge-work-plugins/tree/main/product-management) 本地化，并绑定本仓库架构与工程 Skill。

## 先读

- [map-design-product.md](./references/map-design-product.md) — 三 App、工作台术语、handoff  
- [source-pin.md](./references/source-pin.md) — 上游版本与再同步  
- 产出目录：`docs/product/`

## 选哪个 Skill

| 用户意图 | Skill | 命令示例 |
| --- | --- | --- |
| 写 PRD / 功能规格 | `pm-write-spec` | `/pm-write-spec 快捷工具条按分类排序` |
| 路线图 / 优先级 | `pm-roadmap-update` | `/pm-roadmap-update Q3 工作台能力` |
| 周报 / 汇报 / ADR | `pm-stakeholder-update` | `/pm-stakeholder-update 工程周报` |
| 访谈 / 调研归纳 | `pm-synthesize-research` | `/pm-synthesize-research` + 粘贴笔记 |
| 竞品分析 | `pm-competitive-brief` | `/pm-competitive-brief 对比 XX 地图平台` |
| 指标 / OKR | `pm-metrics-review` | `/pm-metrics-review 工作台活跃` |
| 头脑风暴 / 探索 | `pm-product-brainstorming` | `/pm-product-brainstorming 命令面板是否必要` |
| 迭代 / Sprint | `pm-sprint-planning` | `/pm-sprint-planning 双周前端` |

不确定时：**先** `/pm-product-brainstorming` 或 `/pm-write-spec`，定稿后再排期。

## 推荐流程

```
探索 → pm-product-brainstorming
  ↓
规格 → pm-write-spec → 写入 docs/product/
  ↓
对齐 → pm-roadmap-update / pm-stakeholder-update
  ↓
实现 → saas-fsd-feature + map-workspace-ui + repo-ui-package
  ↓
验证 → webapp-testing + pnpm --filter @repo/saas-web validate
```

## 写规格时的 map-design 检查清单

- [ ] 目标 App 是否为 `@repo/saas-web`（或明确 admin/marketing）  
- [ ] 是否涉及侧栏 `kind`、快捷工具条、Dock、Drawer（引用 map-workspace-ui）  
- [ ] 鉴权 / 租户边界是否写清（RuoYi 过渡约束）  
- [ ] UI 是否注明 shadcn `@repo/ui`，而非 app 内重复组件  
- [ ] 验收标准能否对应 FSD 路径与 `validate` 命令  
- [ ] Non-Goals 是否排除 yunyan Vue 栈与未规划 i18n  

## 语言

- 与用户同语言（中文对话 → 中文 PRD）  
- 文件 slug 用英文 kebab-case；标题可中文  

## 再同步上游

```bash
# 更新 vendor 后
node .cursor/skills/scripts/sync-pm-skills.mjs
node .cursor/skills/scripts/validate-skills.mjs
```
