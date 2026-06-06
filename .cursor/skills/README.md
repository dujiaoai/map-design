# Cursor Skills（map-design）

本项目 Agent Skills，遵循 [Agent Skills 规范](https://agentskills.io) 与 [anthropics/skills](https://github.com/anthropics/skills) 结构。

## 项目 Skill

| Skill | 用途 |
| --- | --- |
| `map-workspace-ui` | 地图工作台 UI 载体、快捷工具条、表面拖拽 |
| `map-plugin-integration` | map-plugin-bridge、registry、MapProvider 接入 |
| `saas-auth-ruoyi` | RuoYi 登录、bootstrap、Session、RBAC |
| `saas-fsd-feature` | FSD 分层、新增 feature、monorepo 边界 |
| `repo-ui-package` | `@repo/ui` shadcn 组件与设计 token |
| `cloud-uav-esm-plugin` | `cloud/uav` ESM 远程模块 |
| `saas-theme-mode` | 浅色/深色主题、语义 token、dark: 写法 |
| `git-commit` | 根据 git diff 生成 Conventional Commit 信息 |
| **`saas-product`** | **PM 编排入口（PRD / 路线图 / 研究 handoff）** |

## 产品 Skill（Anthropic PM Plugin 本地化）

上游：[anthropics/knowledge-work-plugins/product-management](https://github.com/anthropics/knowledge-work-plugins/tree/main/product-management)（Apache-2.0）。再同步见 `saas-product/references/source-pin.md`。

| Skill | 用途 | 命令 |
| --- | --- | --- |
| `pm-write-spec` | PRD、用户故事、MoSCoW、验收标准 | `/pm-write-spec` |
| `pm-roadmap-update` | 路线图、RICE/MoSCoW、Now/Next/Later | `/pm-roadmap-update` |
| `pm-stakeholder-update` | 周报/汇报、ADR、干系人沟通 | `/pm-stakeholder-update` |
| `pm-synthesize-research` | 访谈归纳、Persona、机会区 | `/pm-synthesize-research` |
| `pm-competitive-brief` | 竞品矩阵、定位、赢/输分析 | `/pm-competitive-brief` |
| `pm-metrics-review` | 指标复盘、OKR、仪表盘需求 | `/pm-metrics-review` |
| `pm-product-brainstorming` | 头脑风暴、JTBD、假设检验 | `/pm-product-brainstorming` |
| `pm-sprint-planning` | Sprint 目标、容量、P0/Stretch | `/pm-sprint-planning` |

产出目录：`docs/product/`。map-design 约束：`.cursor/skills/saas-product/references/map-design-product.md`。

## 地图插件 Skill 包（v1.3.1）

可移植 skill 包，描述 **52 个** Map Tool 的产品契约（非 saas-web 桥接）。架构文档：[map-plugins-catalog.md](../../docs/architecture/map-plugins-catalog.md)。

| Skill | 用途 |
| --- | --- |
| `map-plugins-index` | 按能力分类的插件索引 |
| `map-workspace-host-react` | 宿主契约（在 `map-plugins-pack/` 内） |
| `map-plugin-{name}` × 52 | 单插件产品规格 + React 实现指南 |
| `map-plugins-pack/` | 打包副本，便于拷贝到其它项目 |

**工作流**：`map-workspace-host-react` → `map-plugins-index` 选型 → `@map-plugin-xxx` → 桥接仍用 `map-plugin-integration`。

**saas-web 现状**：registry + 侧栏 mock 登记 **11** 个 toolId；MapProvider / 真实 bridge **待接**（Phase C）。

## 官方 Skill（自 anthropics/skills 拷贝）

| Skill | 用途 |
| --- | --- |
| `skill-creator` | 创建/优化 Skill |
| `frontend-design` | 高质量前端 UI 设计 |
| `webapp-testing` | Vitest + Playwright（见 `references/`） |

## 使用方式

在 Cursor Chat 中：

**产品**

- `/saas-product 我要写工作台新功能的 PRD`
- `/pm-write-spec 快捷工具条分类排序`
- `/pm-roadmap-update Q3 能力排期`
- `/pm-synthesize-research`（粘贴访谈笔记）

**工程**

- `/map-workspace-ui 给快捷工具条加一个工具`
- `/map-plugin-integration 接入 MapProvider bridge`
- `/saas-auth-ruoyi 新增受保护 settings 路由`
- `/repo-ui-package 添加 dialog 组件`
- `/cloud-uav-esm-plugin 新增 dock 模块`
- `/saas-theme-mode 新组件要支持浅色深色`
- `/git-commit 根据改动生成 commit 信息`
- `/saas-fsd-feature 新增 account settings 路由`
- `/frontend-design 优化登录页视觉`
- `/webapp-testing 为 workspace-store 写 Vitest`

## Skill 依赖关系

```
saas-product ──► pm-* ──► docs/product/
       └── handoff ──► saas-fsd-feature ──► map-workspace-ui ──► map-plugin-integration
                    └──► map-plugins-index ──► map-plugin-*（52 个产品契约）
                    └──► saas-auth-ruoyi
                    └──► repo-ui-package ◄── frontend-design
cloud-uav-esm-plugin ──► repo-ui-package
webapp-testing ──► vitest-map-design.md + map-design.md
```

## Rules

| Rule | 触发 |
| --- | --- |
| `saas-product.mdc` | `docs/product/**`、产品 Skill |
| `saas-map-workspace-ui.mdc` | 地图工作台 UI、快捷工具条、surface-drag |
| `saas-map-plugin-integration.mdc` | bridge、registry、lifecycle-sync、workspace-url |
| `saas-auth-ruoyi.mdc` | 登录、session、queries、account、ruoyi-api |
| `saas-repo-ui-package.mdc` | shadcn 优先、`packages/ui` 与 app UI 实现 |
| `saas-theme-mode.mdc` | 组件/UI/CSS 浅色深色主题 |
| `cloud-uav-esm-plugin.mdc` | `cloud/uav/**` |

文件位于 `.cursor/rules/`。编辑匹配 glob 时自动注入；完整流程仍用对应 `/skill` 命令。

## 自我检验

```bash
node .cursor/skills/scripts/validate-skills.mjs
```

同步 Anthropic PM 上游后：

```bash
node .cursor/skills/scripts/sync-pm-skills.mjs
node .cursor/skills/scripts/validate-skills.mjs
```

检查项：`name` 与目录名一致、kebab-case、frontmatter 合法字段、`description` 长度与触发词、正文行数建议。

**尚未配置**：`skill-creator` 的 evals/benchmark（需 Agent 跑 prompt 对比 with/without skill）。项目 Skill 暂无 `evals/evals.json`。

## 来源 pin

| 来源 | 目录 | 同步 |
| --- | --- | --- |
| anthropics/skills | `frontend-design`、`webapp-testing`、`skill-creator` | 手动拷贝 |
| anthropics/knowledge-work-plugins | `pm-*` via `.cursor/_vendor/` | `sync-pm-skills.mjs` |
| map-plugins portable pack | `map-plugin-*`、`map-plugins-index` | `generate-map-plugin-skills.mjs`（上游） |
| 项目自研 | 其余 `saas-*`、`map-plugin-integration`、`git-commit` | — |
