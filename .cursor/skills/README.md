# Cursor Skills（map-design）

本项目 Agent Skills，遵循 [Agent Skills 规范](https://agentskills.io) 与 [anthropics/skills](https://github.com/anthropics/skills) 结构。

## 项目 Skill

| Skill | 用途 |
| --- | --- |
| `map-workspace-ui` | 地图工作台侧栏、Dock、浮层、Drawer 选型 |
| `saas-fsd-feature` | FSD 分层、新增 feature、monorepo 边界 |

## 官方 Skill（自 anthropics/skills 拷贝）

| Skill | 用途 |
| --- | --- |
| `skill-creator` | 创建/优化 Skill |
| `frontend-design` | 高质量前端 UI 设计 |
| `webapp-testing` | Playwright 本地 Web 测试（见 `references/map-design.md`） |

## 使用方式

在 Cursor Chat 中：

- `/map-workspace-ui 给侧栏加一个菜单项`
- `/saas-fsd-feature 新增 account settings 路由`
- `/frontend-design 优化登录页视觉`

## Rules

文件级自动规则见 `.cursor/rules/saas-map-workspace-ui.mdc`（编辑 map-workspace 相关文件时自动注入）。

## 来源 pin

官方 Skill 拷贝自 `anthropics/skills` main 分支（2026-06-06 shallow clone）。
