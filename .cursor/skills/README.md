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

## 官方 Skill（自 anthropics/skills 拷贝）

| Skill | 用途 |
| --- | --- |
| `skill-creator` | 创建/优化 Skill |
| `frontend-design` | 高质量前端 UI 设计 |
| `webapp-testing` | Vitest + Playwright（见 `references/`） |

## 使用方式

在 Cursor Chat 中：

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
saas-fsd-feature ──► map-workspace-ui ──► map-plugin-integration
                 └──► saas-auth-ruoyi
                 └──► repo-ui-package ◄── frontend-design
cloud-uav-esm-plugin ──► repo-ui-package
webapp-testing ──► vitest-map-design.md + map-design.md
```

## Rules

| Rule | 触发 |
| --- | --- |
| `saas-map-workspace-ui.mdc` | 地图工作台 UI、快捷工具条、surface-drag |
| `saas-map-plugin-integration.mdc` | bridge、registry、lifecycle-sync、workspace-url |
| `saas-auth-ruoyi.mdc` | 登录、session、queries、account、ruoyi-api |
| `saas-repo-ui-package.mdc` | shadcn 优先、`packages/ui` 与 app UI 实现 |
| `saas-theme-mode.mdc` | 组件/UI/CSS 浅色深色主题 |
| `cloud-uav-esm-plugin.mdc` | `cloud/uav/**` |

文件位于 `.cursor/rules/`。编辑匹配 glob 时自动注入；完整流程仍用对应 `/skill` 命令。

## 自我检验

校验脚本（对齐 [agentskills.io](https://agentskills.io/specification) + `skill-creator/quick_validate.py` 规则）：

```bash
node .cursor/skills/scripts/validate-skills.mjs
```

检查项：`name` 与目录名一致、kebab-case、frontmatter 合法字段、`description` 长度与触发词、正文行数建议。

**尚未配置**：`skill-creator` 的 evals/benchmark（需 Agent 跑 prompt 对比 with/without skill）。项目 Skill 暂无 `evals/evals.json`。

## 来源 pin
