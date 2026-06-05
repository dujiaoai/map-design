# 地图工作台 UI 载体规范

> 侧栏菜单点击后打开的 UI 形态、状态归属与组件映射。修改 `app-sidebar`、导航 mock、`map-workspace` store 或地图浮层/Dock 时请先读本文。
>
> Cursor 自动规则：[`.cursor/rules/saas-map-workspace-ui.mdc`](../../.cursor/rules/saas-map-workspace-ui.mdc)
>
> 地图插件桥接：[map-plugin-integration.md](./map-plugin-integration.md)

## 链路概览

```
AppSidebar (widgets/app-sidebar)
  → UiAppSidebar (@repo/ui) + NavMain
  → onNavSelect → createNavSelectHandler (features/map-workspace)
  → useMapWorkspaceStore (Zustand)
  → home.tsx 挂载的各 UI 载体组件
```

页脚「通知 / 账号」不经过 `onNavSelect`，由 `AppSidebar` 本地 state 直接打开 Vaul Drawer。

## 侧栏菜单本身（非弹框）

有子项的分组（测量、标绘、应用等）使用 **Collapsible 手风琴**，在侧栏内展开，不是 Popover / Dialog。

- UI：`packages/ui/src/components/nav-main.tsx`
- 叶子项 / 子项点击 → `onNavSelect(id)`

## 菜单行为类型 `NavMainItemKind`

定义：`apps/web/app/entities/navigation/model/types.ts`

| kind | 含义 | 处理函数 | UI 载体 |
| --- | --- | --- | --- |
| `map-tool` | 地图工具 | `toggleMapTool` / `togglePanelTool` | 见 `MapToolPresentation` |
| `map-dock-module` | 机库模块 | `toggleMapDockModule` | `MapDockPanel` |
| `map-module` | 业务模块 | `toggleMapModule` | `MapBusinessDock` |
| `route` | 应用内路由 | `navigate(url)` | 无弹层 |
| `external` | 外部链接 | `window.open` | 无弹层 |

分发：`apps/web/app/features/map-workspace/lib/handle-nav-select.ts`

Mock 菜单：`apps/web/app/entities/navigation/model/mock-nav-items.tsx`

## 侧栏信息架构（mock）

| 段 | 原则 | 典型项 |
| --- | --- | --- |
| **工具** | 画布 `map-tool` + 专题图层、空间分析等业务模块；**段标题可折叠**（localStorage `nav-section-tools`），激活项时自动展开 | 测距、测面、专题、做分析… |
| **运营** | 业务 `map-module` | 看项目、我的收藏、飞行台账… |
| **全景** | 全景点位（tool）+ 制作 / 多观（module） | 同域能力合并一段 |
| **应用** | 路由项直接列出，不再套一层「应用」分组 | 项目管理、组织设置 |

**pluginToolId** 与 `packages-map/map-core` 常量对齐（如 `comparison-plugin`、`ortho-imagery-comparison-plugin`），见 `map-plugin-registry.ts`。

## 地图工具 UI 载体 `MapToolPresentation`

同一 `NavMainItemKind = map-tool` 下，按 `mockToolMeta.presentation` 与 `coordinatorGroup` 分流。

| presentation | 层级 | 特点 | 渲染组件 | 当前 mock 示例 |
| --- | --- | --- | --- | --- |
| `movable-panel` | L3 | 地图 Canvas 上可拖动 Card 浮层，**无遮罩** | `MockMapToolHost` | 测距、测面、绘点、卷帘对比等 |
| `anchor` | L2 | 画布左/右锚点垂直堆叠，**无遮罩** | `MockMapToolHost` | 行政区划 |
| `drawer` | L4 | 地图列**右侧条带**，**无遮罩**，画布可交互 | `MapToolDrawerPanel` | 导入、搜索 |
| `dock` | L1 | 固定 Dock 列（预留） | — | 当前未使用 |

### 互斥域 `MapToolCoordinatorGroup`

| group | store 字段 | 说明 |
| --- | --- | --- |
| `mapInteraction` | `activeMapTool` | 地图互斥工具（movable-panel / anchor） |
| `drawer` | `activeDrawerTool` | 右侧条带工具；与 `activeMapTool` 互斥 |

### 并行浮层 `MapToolCategory = panel`

| category | store 字段 | 说明 |
| --- | --- | --- |
| `mode` | `activeMapTool` | 与其它 mode 工具互斥 |
| `panel` | `activePanelTools[]` | **不与** mode/drawer 互斥；仅侧栏再次点击或面板关闭按钮关闭 |

当前 mock 并行 `panel`：**卷帘对比**、**高清影像对比**（与 packages-map Coordinator 空 deactivate 对齐）。

Store：`apps/web/app/features/map-workspace/model/workspace-store.ts`

### 重要：两种「Drawer」

| 名称 | 实现 | 遮罩 | 用途 |
| --- | --- | --- | --- |
| **地图工具条带** | 自定义 `<aside>` + CSS 动画 | 无 | `MapToolDrawerPanel`（导入、搜索） |
| **Vaul Drawer** | `@repo/ui` → vaul | 有 | 账号 `AccountSheet`、通知 `NotificationSheet` |

不要混用：地图 L4 条带**不要**改用 Vaul `Drawer`。

## 机库 / 业务 Dock（非模态弹框）

| kind | 组件 | 布局 |
| --- | --- | --- |
| `map-dock-module` | `MapDockPanel` | 地图区左侧固定列（机库） |
| `map-module` | `MapBusinessDock` | 地图区左侧固定列（项目/图层/运营等） |

共用外壳 `DockPanelFrame`（`widgets/dock-panel`）：

- 正常：占 flex 列宽，非浮层
- 全屏：`createPortal` 至 `document.body`，锁 `body` overflow，Esc 退出
- 可收起：侧栏再次点击同一项展开；地图左缘 `*Edge` 组件提供辅助展开条

## 页脚入口（侧栏内，非菜单列表）

| 入口 | 第一层 | 第二层 | 组件 |
| --- | --- | --- | --- |
| 通知 | 按钮 | Vaul Drawer（右滑 + 遮罩） | `NotificationSheet` |
| 账号 | DropdownMenu | 「账号」→ Vaul Drawer | `NavUser` → `AccountSheet` |
| 退出 | DropdownMenu 项 | — | `onLogout` |

## 页面挂载顺序

`apps/web/app/routes/home.tsx`：

```
MapDockPanel          ← map-dock-module
MapBusinessDock       ← map-module
  MapPlaceholder
  MockMapToolHost     ← movable-panel / anchor
  MapToolActionBar
  MapToolDrawerPanel  ← drawer (L4)
  MapDockPanelEdge / MapBusinessDockEdge
```

## 新增菜单项检查清单

1. 在 `mock-nav-items.tsx` 增加项，设置正确的 `kind`（及 `toolId` / `moduleId` / `url` / `href`）。
2. `map-tool`：在 `mockToolMeta` 或 `mockNavToolMetaByItemId` 配置 `presentation`、`coordinatorGroup`、`placement`。
3. 选择 UI 载体：
   - 需地图交互 + 小面板 → `movable-panel` 或 `anchor`
   - 需右侧条带且地图保持可操作 → `drawer` + `MapToolDrawerPanel`
   - 机库类 → `map-dock-module`
   - 业务模块 → `map-module`
   - 离开地图页 → `route`
4. 若需 URL 深链，同步 `workspace-url.ts` 与 store 的 `applyFromUrl`。
5. **不要**为地图工具误用 Vaul Drawer；账号/通知类才用 Sheet + vaul。

## 关键文件索引

| 职责 | 路径 |
| --- | --- |
| 侧栏装配 | `apps/web/app/widgets/app-sidebar/ui/app-sidebar.tsx` |
| 导航类型与 mock | `apps/web/app/entities/navigation/` |
| 点击分发 | `apps/web/app/features/map-workspace/lib/handle-nav-select.ts` |
| 工作台状态 | `apps/web/app/features/map-workspace/model/workspace-store.ts` |
| URL 同步 | `apps/web/app/features/map-workspace/lib/workspace-url.ts` |
| 地图工具浮层 | `apps/web/app/widgets/map-tool-host/`（`MapToolPanelHeader` 与 Dock 标题栏同高） |
| 地图 L4 条带 | `apps/web/app/widgets/map-import-drawer/` |
| 机库 Dock | `apps/web/app/widgets/map-dock-panel/` |
| 业务 Dock | `apps/web/app/widgets/map-business-dock/` |
| Dock 外壳 | `apps/web/app/widgets/dock-panel/` |
| 侧栏 UI 基座 | `packages/ui/src/components/app-sidebar.tsx`、`nav-main.tsx` |
