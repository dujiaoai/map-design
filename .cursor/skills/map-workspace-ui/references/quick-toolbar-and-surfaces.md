# 快捷工具条与画布表面拖拽

## 方案 C：map-tool 不进侧栏

高频 `map-tool` 通过画布 **`MapQuickToolbar`** 触达，侧栏保留运营模块、路由项与段级折叠。顶栏 `MapWorkspaceHeader` 提供全局搜索等入口。

工具条点击与侧栏叶子项共用 **`createNavSelectHandler`**，store 与 UI 载体规则不变。

## 快捷工具条

| 项 | 说明 |
| --- | --- |
| Widget | `apps/web/app/widgets/map-quick-toolbar/ui/map-quick-toolbar.tsx` |
| Feature | `apps/web/app/features/map-quick-toolbar/` |
| 目录 | `QUICK_TOOL_CATALOG` — `navItemId` 必须对应 mock 菜单 id |
| 默认项 | `DEFAULT_QUICK_TOOL_IDS`（6 项） |
| 数量限制 | `MIN_QUICK_TOOLS = 1`，`MAX_QUICK_TOOLS = 8` |
| 用户排序 | `map-workspace-quick-toolbar`（localStorage） |
| 工具条位置 | `map-quick-toolbar-position`（localStorage） |
| 首次引导 | `map-quick-toolbar-onboarding-seen` |

### 新增 catalog 项 checklist

1. `mock-nav-items.tsx` 已有 `map-tool` 项且 `mockToolMeta` 正确
2. `quick-toolbar-catalog.ts` 增加 `{ navItemId, label, icon }`
3. 可选：加入 `DEFAULT_QUICK_TOOL_IDS`
4. 运行 `quick-toolbar-prefs.test.ts` / `pnpm --filter @repo/saas-web test`

## workspace-surface-drag

共享 feature：`apps/web/app/features/workspace-surface-drag/`。

基于 **@dnd-kit** + 统一 snap/clamp 数学（`surface-drag-math.ts`）。

### 常量

| 常量 | 值 | 用途 |
| --- | --- | --- |
| `EDGE_MARGIN` | 8 | 画布边距 |
| `SNAP_THRESHOLD` | 28 | 吸附阈值（px） |
| `NEEDS_LAYOUT_CENTER` | -1 | 预留：首次居中布局 |
| `NEEDS_LAYOUT_ANCHOR` | -2 | 首次锚点布局（anchor 面板） |
| `PANEL_ANCHOR_TOP` | 56 | anchor 面板默认 top |
| `PANEL_ANCHOR_INSET` | 12 | anchor 面板左右 inset |

### 消费者

| 消费者 | dragId / storage | 说明 |
| --- | --- | --- |
| `MapQuickToolbar` | `QUICK_TOOLBAR_DRAG_ID` | 整条条带可拖；sortable 排序工具图标 |
| `movable-tool-panel` | `createMovablePanelDragId(toolId)` | 单工具浮层；`loadPanelSurfacePosition` |

面板位置持久化前缀：`map-workspace-panel-position:{storageKey}`。

### Hook：`useWorkspaceSurfaceDnd`

传入 `containerRef`、`elementRef`、`dragId`、`initialPosition`、`resolveDefault`、`onPersist` 等。拖拽时渲染 `WorkspaceSnapGuides`（左/中/右竖线 + 顶边横线）。

改 snap 行为只改 `surface-drag-math.ts`，并跑 `surface-drag-math.test.ts`。

## 地图工具浮层滚动（防反复出现滚动条）

| 层级 | 组件 / 类 | 职责 |
| --- | --- | --- |
| 外壳 | `mapToolPanelShellClass` | `max-h` + `flex flex-col overflow-hidden` + `min-h-0` |
| 唯一滚动层 | `MapToolPanelBody`（`map-tool-panel-header.tsx`） | `min-h-0 flex-1 overflow-y-auto` + `.map-tool-panel-body` 隐藏滚动条 |
| 工具内容根 | `MockToolPanelRoot` | 仅 `space-y-3 text-sm`，**禁止** `overflow-y-auto` |

`movable-tool-panel` 与 `map-tool-anchor-column` 已在 header 下包裹 `MapToolPanelBody`；新增 mock 工具内容请用 `MockToolPanelRoot`，勿在根节点加滚动。

回归：`pnpm --filter @repo/saas-web test tool-content-scroll-policy`

## CSS 类名

拖拽中元素可加：

- `workspace-surface-dragging`
- `workspace-map-toolbar--dragging`（工具条）

吸附参考线：`workspace-surface-snap-guides`、`workspace-surface-snap-guide--active`。
