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

权威实现：`apps/web/app/routes/home.tsx`。Agent 改首页时**只改编排**，不在 route 内写 store 分支或菜单分发逻辑。

### 整页结构

```
workspace-page
├── SidebarProvider
│   ├── MapWorkspaceUrlSync / MapToolLifecycleSync / MapWorkspaceKeyboardSync  ← 无 UI，挂载即生效
│   ├── AppSidebar
│   └── SidebarInset (workspace-inset)
│       ├── MapWorkspaceHeader          ← 顶栏（面包屑、命令入口、通知/账号）
│       ├── workspace-main
│       │   ├── MapContextPanel         ← 左列：map-module / map-dock-module（全局互斥）
│       │   └── workspace-canvas        ← 见下「画布层」
│       └── MapStatusBar                ← 底栏坐标/比例尺等
├── AccountSheet                        ← Vaul，SidebarProvider 外
├── NotificationSheet                   ← Vaul，SidebarProvider 外
└── WorkspaceCommandPalette             ← 全局命令面板（Cmd/Ctrl+K）
```

### 画布层（`workspace-canvas` 内，自底向上）

DOM 顺序即叠层参考；新增 chrome 优先插在 **QuickToolbar 与 MockMapToolHost 之间**（与 `MapControls` 同级），勿插在 ToolHost 与 Drawer 之间以免遮挡工具浮层。

| 顺序 | 组件 | 职责 | store / 数据 |
| --- | --- | --- | --- |
| 1 | `WorkspaceMapAtmosphere` | 指挥舱背景（网格/光晕），工具激活时可 `subdued` | 读 `useMapEngineReady`、是否有 active 工具 |
| 2 | `MapCanvasContextMenu` | 画布右键菜单壳 | 本地 / 后续接地图引擎 |
| 3 | `MapPlaceholder` | 地图引擎占位 / 未来 MapProvider 挂载点 | — |
| 4 | `MapQuickToolbar` | 方案 C：高频 `map-tool` 快捷入口 | 经 `createNavSelectHandler` |
| 5 | `MapControls` | map-chrome：指北针、缩放、图例/图层 wing | 局部 mock + `useMapControlsInset` |
| 6 | `MockMapToolHost` | `movable-panel` / `anchor` / 并行 `panel` | `activeMapTool` / `activePanelTools` |
| 7 | `MapToolDrawerPanel` | L4 右侧条带（`presentation: drawer`） | `activeDrawerTool` |
| 8 | `MapNativeModuleHost` | `display` 类模块（右条/右下，不与左列并行） | 侧栏模块 + `usesLeftContextPanel` 分流 |
| 9 | `MapContextPanelEdge` | 左列模块收起后的**唯一**左缘展开条 | 与 `MapContextPanel` 互斥，无堆叠 |

`MapContextPanel` 与 `workspace-canvas` 在 `workspace-main` 内**并列**（flex 行），不在 canvas 内部。

### 同步组件（无 UI）

| 组件 | 路径 | 作用 |
| --- | --- | --- |
| `MapWorkspaceUrlSync` | `features/map-workspace/` | URL ↔ store 深链 |
| `MapToolLifecycleSync` | `features/map-workspace/` | 地图工具与 bridge 生命周期 |
| `MapWorkspaceKeyboardSync` | `features/map-workspace/` | 全局快捷键（含命令面板） |

须放在 `SidebarProvider` 内、与侧栏/主内容同级，保证路由切换时仍挂载。

### 页级浮层（`SidebarProvider` 外）

| 组件 | 实现 | 用途 |
| --- | --- | --- |
| `AccountSheet` | Vaul Drawer + 遮罩 | 账号资料 |
| `NotificationSheet` | Vaul Drawer + 遮罩 | 通知列表 |
| `WorkspaceCommandPalette` | 自定义 / cmdk | 顶栏搜索、快捷导航 |

**不要**将地图 L4 条带（`MapToolDrawerPanel`）改为 Vaul；**不要**把机库/业务模块做成模态 Dialog 挡地图。

### Agent 新增组件指引

| 类型 | 建议挂载位 |
| --- | --- |
| 新高频 `map-tool` | 侧栏 mock + `quick-toolbar-catalog`；不必改 `home.tsx` |
| 新 map-chrome（罗盘、比例尺类） | `MapControls` 同级或扩展现有 `widgets/map-controls` |
| 新画布浮层工具 | 扩展 `MockMapToolHost` / `MapToolDrawerPanel`，勿在 `home.tsx` 新写 store |
| 新左列业务/机库模块 | `MapContextPanel` 内嵌 Dock，勿新增第二个左列壳 |
| 新全局 Sheet | `SidebarProvider` 外，与 `AccountSheet` 并列 |

样式：工作台页级 CSS 见 `apps/web/app/routes/home.css`；主题固定深色（`html.dark`），见 Skill **`saas-theme-mode`**。

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
| 地图 chrome 控件 | `apps/web/app/widgets/map-controls/`（指北针、缩放、图例/图层 wing） |
| 顶栏与工作台 chrome | `apps/web/app/widgets/map-workspace-header/`、`widgets/workspace-chrome/` |
| 命令面板 | `apps/web/app/widgets/workspace-command-palette/` |
| 画布大气/壳 | `apps/web/app/widgets/workspace-shell/`（`WorkspaceMapAtmosphere`） |
| 首页编排 | `apps/web/app/routes/home.tsx`、`home.css` |
| 载体分流 | `apps/web/app/entities/navigation/lib/uses-left-context-panel.ts` |
| 侧栏模块展开条 | `apps/web/app/widgets/map-context-panel/ui/map-context-panel-edge.tsx` |
| 机库 Dock 内容 | `apps/web/app/widgets/map-dock-panel/` |
| 业务 Dock 内容 | `apps/web/app/widgets/map-business-dock/` |
| Dock 外壳 | `apps/web/app/widgets/dock-panel/` |
| 侧栏 UI 基座 | `packages/ui/src/components/app-sidebar.tsx`、`nav-main.tsx` |
