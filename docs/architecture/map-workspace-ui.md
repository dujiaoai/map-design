# 地图工作台 UI 载体规范

> 侧栏菜单点击后打开的 UI 形态、状态归属与组件映射。修改 `app-sidebar`、导航 mock、`map-workspace` store 或地图浮层/Dock 时请先读本文。
>
> Cursor 自动规则：`.cursor/rules/saas-map-workspace-ui.mdc`（及 `saas-map-plugin-integration.mdc` 等，见 `.cursor/skills/README.md`）
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

对齐 [map-plugins-catalog.md](./map-plugins-catalog.md) 模块分类。`map-tool` 仍走快捷工具条（方案 C），不进侧栏列表。

| 段 | catalog 模块 | 典型项 | 路由 / 槽位 |
| --- | --- | --- | --- |
| **图层** | parallel-panel / display | 专题图层、景点聚类、图例 | `/data/:moduleId` → `activeModuleId` |
| **分析** | modify-panel 互斥组 | 做分析、属性查看、我的收藏 | `/data/:moduleId` → `activeModuleId` |
| **运营** | display / 业务面板 | 看项目、飞行数据、事件… | `/ops/:moduleId` → `activeModuleId` |
| **机库** | uav-workspace | 机库列表 / 设置 / 收藏 | `/uav/:moduleId` → `activeDockModuleId` |
| **应用** | — | 项目管理、组织设置、外链 | 无 Dock |

**段顺序**：图层 → 分析 → 运营 → 机库 → 应用。定稿说明见 [2026-06-workspace-nav-ia.md](../product/2026-06-workspace-nav-ia.md)。

### 侧栏模块全局互斥

`map-module` 与 `map-dock-module` **任意时刻仅一个**处于展开态（图层/分析/运营/机库之间切换会关闭上一个）。左侧由 **`MapContextPanel`** 统一承载单层外壳（`embedded` 模式内嵌 `MockModuleContent`），不再出现双层标题栏或 Tab 切换。

Store：`toggleMapModule` / `toggleMapDockModule` 打开新模块前调用 `clearAllSidebarModules()`。

**载体分流**（`usesLeftContextPanel`，与运营段一致）：

| pluginType | 载体 |
| --- | --- |
| `display` | 画布 `MapNativeModuleHost`（右条/右下，单层壳） |
| `parallel-panel`、`modify-panel` 等 | 左列 `MapContextPanel` |
| 机库 | 左列 `MapContextPanel` |

URL 深链：pathname 只反映当前唯一模块；`?data=` 查询参数已移除。

各 `mockModuleMeta` 含 `pluginToolId` / `pluginType`，与 Skill `map-plugin-*` 一一对应。

**pluginToolId** 与 `packages-map/map-core` 常量对齐（如 `comparison-plugin`、`ortho-imagery-comparison-plugin`），见 `map-plugin-registry.ts`。

完整 **52 个**插件能力说明、类型（tool / display / map-chrome 等）与 saas-web 接入状态见 [map-plugins-catalog.md](./map-plugins-catalog.md)。

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
| `map-dock-module` | `MapDockPanel`（`embedded`） | `MapContextPanel` 内唯一左列 |
| `map-module` | `MapBusinessDock`（`embedded`） | `MapContextPanel` 内唯一左列 |

侧栏模块 **全局互斥**；外壳由 `MapContextPanel` → `ContextPanelShell` 统一提供 `DockPanelHeader`，内层 Dock 仅渲染内容。

独立使用（非嵌入）时仍可用 `DockPanelFrame`（`embedded={false}`）：

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
MapContextPanel       ← 侧栏模块唯一左列（全局互斥，单层 ContextPanelShell）
  workspace-canvas
    MapPlaceholder
    MapQuickToolbar   ← 方案 C：高频 map-tool 快捷入口
    MockMapToolHost   ← movable-panel / anchor / panel
    MapToolDrawerPanel← drawer (L4)
    MapNativeModuleHost ← display 模块（不与左列并行）
    MapContextPanelEdge ← 左列模块收起后的唯一展开条
MapStatusBar
```

页级 Vaul：`AccountSheet`、`NotificationSheet`（在 `SidebarProvider` 外）。

## 快捷工具条（方案 C）

侧栏不再列出高频 `map-tool`；改由画布 **`MapQuickToolbar`** 触发，与侧栏共用 `createNavSelectHandler`。

| 项 | 路径 |
| --- | --- |
| Widget | `widgets/map-quick-toolbar/` |
| 目录与 prefs | `features/map-quick-toolbar/`（`QUICK_TOOL_CATALOG`，最多 8 项） |
| 位置拖拽 | `features/workspace-surface-drag/` + `map-quick-toolbar-position` |

新增 catalog 项前须先在 `mock-nav-items.tsx` 存在对应 `map-tool`。Agent Skill：`.cursor/skills/map-workspace-ui/references/quick-toolbar-and-surfaces.md`。

## 画布表面拖拽

`features/workspace-surface-drag` 为快捷工具条与 `movable-tool-panel` 提供统一 @dnd-kit 拖拽、边距 clamp 与左/中/右吸附参考线。面板位置持久化键前缀 `map-workspace-panel-position:`。


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
| 上下文面板 | `apps/web/app/widgets/map-context-panel/` |
| 原生模块载体 | `apps/web/app/widgets/map-native-module-host/` |
| 载体分流 | `apps/web/app/entities/navigation/lib/uses-left-context-panel.ts` |
| 侧栏模块展开条 | `apps/web/app/widgets/map-context-panel/ui/map-context-panel-edge.tsx` |
| 机库 Dock 内容 | `apps/web/app/widgets/map-dock-panel/` |
| 业务 Dock 内容 | `apps/web/app/widgets/map-business-dock/` |
| Dock 外壳 | `apps/web/app/widgets/dock-panel/` |
| 侧栏 UI 基座 | `packages/ui/src/components/app-sidebar.tsx`、`nav-main.tsx` |
