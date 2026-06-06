---
name: repo-ui-package
description: >-
  Add and modify shadcn/Base UI components in @repo/ui for map-design. Use when
  implementing UI: prefer existing shadcn primitives from @repo/ui first; run
  ui:add when missing. Also for globals.css, sidebar composites, brand tokens,
  or Vite alias—even if the user says "add a dialog", "build a form", or
  "create a button".
metadata:
  author: map-design
  version: "1.1.0"
compatibility: Requires packages/ui (@repo/ui), Tailwind CSS v4, shadcn CLI.
---

# @repo/ui Package

## 先读文档

| 主题 | 文档 |
| --- | --- |
| Packages 总览 | [docs/architecture/packages.md](../../docs/architecture/packages.md#repo-ui) |
| 前端约束 | [../frontend-design/references/map-design.md](../frontend-design/references/map-design.md) |
| Cloud 消费差异 | [../cloud-uav-esm-plugin/SKILL.md](../cloud-uav-esm-plugin/SKILL.md) |

## 边界

| 允许 | 禁止 |
| --- | --- |
| 通用 UI、侧栏复合组件、设计 token | 业务 store、RuoYi 请求、map-workspace 状态 |
| 导出经 `packages/ui/index.ts` | App 反向修改 packages 内部路径绕过 export |
| saas-web + cloud-uav 共用 | 在 apps/web 另起 shadcn 实例 |

业务逻辑留在 `apps/web/app/widgets/*` 或 `features/*`（见 `map-workspace-ui` 禁止项）。

## shadcn 优先（实现功能组件）

**默认路径**：功能 UI = 组合 `@repo/ui` 里的 shadcn 组件，而不是手写 `<button>` / 自建 Modal。

```
1. 查 packages/ui/index.ts 是否已有（Button、Input、Dialog、Sheet、Tabs、Select…）
2. 有 → import { … } from '@repo/ui'，样式走 saas-theme-mode 语义 token
3. 无 → pnpm --filter @repo/ui ui:add <name> → 加入 index.ts 导出 → 再使用
4. 仅 shadcn 明显不适用 → 自定义 DOM（须注释原因，如地图 L4 条带、无遮罩 HUD）
```

| 场景 | 优先选用 |
| --- | --- |
| 按钮、链接 | `Button` |
| 表单 | `Input`、`Label` + RHF/Zod（feature 层） |
| 确认、设置 | `Dialog` / `Sheet`（账号/通知用 Drawer） |
| 菜单、操作 | `DropdownMenu` |
| 列表筛选 | `Tabs`、`Select` |
| 提示 | `Tooltip` |

**禁止**：在 `apps/web` 执行 `shadcn init`；复制 shadcn 源码到 widget；引入第二套 UI 库。

## 添加 shadcn 组件

在 **packages/ui** 根目录执行：

```bash
pnpm --filter @repo/ui ui:add dialog
pnpm --filter @repo/ui ui:add drawer tabs
```

- 配置：`packages/ui/components.json`（style: `base-vega`，css: `src/styles/globals.css`）
- 生成路径：`packages/ui/src/components/ui/`
- 新组件须在 `packages/ui/index.ts` 导出 Public API

## 设计 token

| 项 | 位置 |
| --- | --- |
| 品牌主色 | `--brand: #3094ff` in `src/styles/globals.css` |
| 全局样式 | `@repo/ui/styles/globals.css` |
| UI 语言 | 固定中文（组件默认文案可中文，无 i18n） |

改色优先改 CSS 变量，勿在 app 层硬编码 `#3094ff` 散落。

主题（浅/深）见 Skill **`saas-theme-mode`**；改 token 时同步检查 `:root` 与 `.dark`。

## App 消费约定（saas-web）

`apps/web/vite.config.ts` alias → `packages/ui` **源码**（非构建产物）。

`apps/web/app/app.css`：

```css
@import "../../../packages/ui/src/styles/globals.css";
@source "../../../packages/ui/src/**/*.{ts,tsx}";
```

## 复合组件（SaaS 侧栏）

| 组件 | 路径 | 用途 |
| --- | --- | --- |
| `AppSidebar` | `src/components/app-sidebar.tsx` | 侧栏容器（无业务 store） |
| `NavMain` | `src/components/nav-main.tsx` | Collapsible 导航 |
| `NavUser` / `NavNotifications` | `src/components/` | 页脚入口 |
| `TeamSwitcher` | `src/components/team-switcher.tsx` | 租户切换 UI |

地图菜单 mock、workspace store 在 `apps/web`，不在 `@repo/ui`。

## Drawer / 微前端注意

- 地图 L4 条带：**不用** Vaul Drawer（见 `map-workspace-ui`）
- 账号/通知 Sheet：用 `@repo/ui` Drawer（vaul）
- Cloud UAV：避免 `DrawerClose asChild` + nested Button — 用 `DrawerCloseButton`（见 cloud skill）

## 工作流 checklist

0. **shadcn 优先**：确认能否用现有 `@repo/ui` 导出；不能则 `ui:add`
1. `pnpm --filter @repo/ui ui:add <component>`
2. 确认 `index.ts` 导出
3. 若新类名需 Tailwind 扫描 — app 已 `@source` 整个 ui 目录，一般无需改 app
4. `pnpm --filter @repo/saas check`（Biome 全仓）
5. 视觉变更大时叠加 Skill `frontend-design`

## 验证

```bash
pnpm --filter @repo/saas check
pnpm --filter @repo/saas-web validate
```
