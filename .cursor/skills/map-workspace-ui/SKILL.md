---
name: map-workspace-ui
description: >-
  Guides changes to saas-web map workspace UI: sidebar nav, Dock panels,
  movable map tool hosts, L4 drawer strips, and Vaul sheets. Use when editing
  app-sidebar, map-workspace store, mock-nav-items, home.tsx map carriers,
  or map-tool-host widgets in apps/web.
---

# Map Workspace UI（@repo/saas-web）

## 先读文档

- 完整规范：[docs/architecture/map-workspace-ui.md](../../docs/architecture/map-workspace-ui.md)
- 插件桥接：[docs/architecture/map-plugin-integration.md](../../docs/architecture/map-plugin-integration.md)

## 数据流

```
AppSidebar → onNavSelect → createNavSelectHandler → workspace-store → home.tsx 载体
```

页脚「通知 / 账号」不经过 `onNavSelect`，由 `AppSidebar` 本地 state 打开 Vaul Drawer。

## kind → UI 载体

| kind | UI 载体 | store 字段 |
| --- | --- | --- |
| `map-tool` + `movable-panel` / `anchor` + `category: mode` | `MockMapToolHost` | `activeMapTool`（互斥） |
| `map-tool` + `category: panel` | `MockMapToolHost` | `activePanelTools[]`（并行） |
| `map-tool` + `presentation: drawer` | `MapToolDrawerPanel` | `activeDrawerTool` |
| `map-dock-module` | `MapDockPanel` | `activeDockModuleId` |
| `map-module` | `MapBusinessDock` | `activeModuleId` |
| `route` / `external` | 路由 / 新窗口 | 无弹层 |

## 两种 Drawer（禁止混用）

| 名称 | 实现 | 遮罩 | 用途 |
| --- | --- | --- | --- |
| 地图 L4 条带 | 自定义 `<aside>` | 无 | 导入、搜索 |
| 账号/通知 | `@repo/ui` Vaul Drawer | 有 | AccountSheet、NotificationSheet |

## 新增菜单 checklist

1. `entities/navigation/model/mock-nav-items.tsx` — 设 `kind` 与 id
2. `map-tool` — 配 `mockToolMeta.presentation`、`coordinatorGroup`
3. 需 URL 深链 — 同步 `features/map-workspace/lib/workspace-url.ts`
4. 运行验证：`pnpm --filter @repo/saas-web test`

## 关键文件

| 职责 | 路径 |
| --- | --- |
| 侧栏装配 | `apps/web/app/widgets/app-sidebar/ui/app-sidebar.tsx` |
| 状态机 | `apps/web/app/features/map-workspace/model/workspace-store.ts` |
| 点击分发 | `apps/web/app/features/map-workspace/lib/handle-nav-select.ts` |
| 页面挂载 | `apps/web/app/routes/home.tsx` |
| 侧栏 UI 基座 | `packages/ui/src/components/nav-main.tsx` |

## 禁止

- 地图 L4 条带改用 Vaul Drawer
- 在 `packages/ui/AppSidebar` 写业务 store 逻辑
- 机库/业务模块做成模态 Dialog 挡地图
