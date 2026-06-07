---
name: map-workspace-ui
description: >-
  Guides saas-web map workspace UI in map-design: sidebar nav, Dock columns,
  movable tool panels, L4 drawer strips, Vaul account/notification sheets,
  canvas quick toolbar, and workspace surface drag/snap. Use whenever editing
  app-sidebar, mock-nav-items, map-workspace store, home.tsx carriers,
  map-tool-host, map-quick-toolbar, workspace-surface-drag, or navigation
  mock—even if the user only says "add a map tool", "fix the toolbar", or
  "make the panel draggable".
metadata:
  author: map-design
  version: "1.1.0"
compatibility: Requires map-design monorepo apps/web (@repo/saas-web) and @repo/ui.
---

# Map Workspace UI（@repo/saas-web）

## 先读文档

| 主题 | 文档 |
| --- | --- |
| UI 载体与 kind 映射 | [docs/architecture/map-workspace-ui.md](../../docs/architecture/map-workspace-ui.md) |
| 插件桥接 | [docs/architecture/map-plugin-integration.md](../../docs/architecture/map-plugin-integration.md) |
| 插件 Skill | [../map-plugin-integration/SKILL.md](../map-plugin-integration/SKILL.md) |
| 快捷工具条与表面拖拽 | [references/quick-toolbar-and-surfaces.md](references/quick-toolbar-and-surfaces.md) |

完整 carrier 表、Coordinator 互斥域、侧栏段折叠见架构文档；本 Skill 聚焦 Agent 工作流与禁止项。

## 数据流

```
AppSidebar → onNavSelect → createNavSelectHandler → workspace-store → home.tsx 载体
MapQuickToolbar → createNavSelectHandler（同一分发，不经侧栏列表）
```

页脚「通知 / 账号」不经过 `onNavSelect`，由 `AppSidebar` / `MapWorkspaceHeader` 本地 state 打开 Vaul Drawer。

## 画布挂载顺序（`home.tsx`）

在 `workspace-canvas` 内，自底向上：

1. `MapPlaceholder`
2. `MapQuickToolbar` — 画布快捷工具条（方案 C：`map-tool` 不进侧栏列表）
3. `MockMapToolHost` — movable-panel / anchor / panel 浮层
4. `MapToolDrawerPanel` — L4 右侧条带（drawer presentation）
5. `MapContextPanelEdge` — 侧栏模块收起后的唯一左缘展开条（全局互斥，无堆叠）

Dock 列（`MapContextPanel` 内）与上述浮层并列，见架构文档。

## kind → UI 载体（摘要）

| kind / presentation | UI 载体 | store 字段 |
| --- | --- | --- |
| `map-tool` + movable-panel / anchor + `category: mode` | `MockMapToolHost` | `activeMapTool`（互斥） |
| `map-tool` + `category: panel` | `MockMapToolHost` | `activePanelTools[]`（并行） |
| `map-tool` + `presentation: drawer` | `MapToolDrawerPanel` | `activeDrawerTool` |
| `map-dock-module` | `MapDockPanel`（嵌入 `MapContextPanel`） | `activeDockModuleId`，与 data/workspace 互斥 |
| `map-module` | `MapBusinessDock`（嵌入 `MapContextPanel`） | `activeModuleId`，全局互斥 |
| `route` / `external` | 路由 / 新窗口 | 无弹层 |

## 两种 Drawer（禁止混用）

| 名称 | 实现 | 遮罩 | 用途 |
| --- | --- | --- | --- |
| 地图 L4 条带 | 自定义 `<aside>` | 无 | 导入、搜索 |
| 账号/通知 | `@repo/ui` Vaul Drawer | 有 | `AccountSheet`、`NotificationSheet` |

## 工作流

### 新增侧栏 / 路由菜单

1. `entities/navigation/model/mock-nav-items.tsx` — 设 `kind` 与 id
2. `map-tool` — 配 `mockToolMeta.presentation`、`coordinatorGroup`、`placement`
3. 需 URL 深链 — 同步 `features/map-workspace/lib/workspace-url.ts`
4. 验证：`pnpm --filter @repo/saas-web test`

### 新增快捷工具条项

1. 先在 `mock-nav-items.tsx` 存在对应 `map-tool` 项
2. 将 `navItemId` 加入 `features/map-quick-toolbar/lib/quick-toolbar-catalog.ts`
3. 按需更新 `DEFAULT_QUICK_TOOL_IDS`（1–8 项，`MAX_QUICK_TOOLS = 8`）
4. 点击仍走 `createNavSelectHandler`，勿另写 store 分支

### 改浮层 / 工具条定位与吸附

1. 复用 `features/workspace-surface-drag`（`useWorkspaceSurfaceDnd`、`WorkspaceSnapGuides`）
2. 工具条：`QUICK_TOOLBAR_DRAG_ID` + `map-quick-toolbar-position`（prefs）
3. 工具面板：`createMovablePanelDragId` + `map-workspace-panel-position:{key}`（storage）
4. 勿在 widget 内手写 clamp/snap 数学，改 `surface-drag-math.ts`

## 关键文件

| 职责 | 路径 |
| --- | --- |
| 侧栏装配 | `apps/web/app/widgets/app-sidebar/ui/app-sidebar.tsx` |
| 导航 mock | `apps/web/app/entities/navigation/model/mock-nav-items.tsx` |
| 状态机 | `apps/web/app/features/map-workspace/model/workspace-store.ts` |
| 点击分发 | `apps/web/app/features/map-workspace/lib/handle-nav-select.ts` |
| 页面挂载 | `apps/web/app/routes/home.tsx` |
| 快捷工具条 widget | `apps/web/app/widgets/map-quick-toolbar/` |
| 快捷工具条 prefs | `apps/web/app/features/map-quick-toolbar/` |
| 表面拖拽 feature | `apps/web/app/features/workspace-surface-drag/` |
| 可拖动工具面板 | `apps/web/app/widgets/map-tool-host/ui/movable-tool-panel.tsx` |
| 侧栏 UI 基座 | `packages/ui/src/components/nav-main.tsx` |

## 禁止

- 地图 L4 条带改用 Vaul Drawer
- 在 `packages/ui/AppSidebar` 写业务 store 逻辑
- 机库/业务模块做成模态 Dialog 挡地图
- 快捷工具条点击绕过 `createNavSelectHandler` 直接改 store
- 在 widget 重复实现 surface snap/clamp（用 `workspace-surface-drag`）

## 验证

```bash
pnpm --filter @repo/saas-web test
pnpm --filter @repo/saas-web validate
```
