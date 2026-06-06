---
name: map-plugin-integration
description: >-
  Integrates Map Tool Plugins with saas-web via map-plugin-bridge, registry, and
  MapToolLifecycleSync. Use when wiring MapProvider, adding pluginToolId entries,
  lazy-loading map-plugins, or syncing store/URL with the map engine—even if
  the user says "connect the map", "start measure plugin", or "Phase C bridge".
metadata:
  author: map-design
  version: "1.0.0"
compatibility: Requires map-design apps/web and packages-map map-plugins (parent monorepo).
---

# Map Plugin Integration

## 先读文档

| 主题 | 文档 |
| --- | --- |
| 完整架构 | [docs/architecture/map-plugin-integration.md](../../docs/architecture/map-plugin-integration.md) |
| **插件能力目录（52 个）** | [docs/architecture/map-plugins-catalog.md](../../docs/architecture/map-plugins-catalog.md) |
| UI 载体与 store | [docs/architecture/map-workspace-ui.md](../../docs/architecture/map-workspace-ui.md) |
| UI 载体 Skill | [../map-workspace-ui/SKILL.md](../map-workspace-ui/SKILL.md) |
| 插件索引 Skill | [../map-plugins-index/SKILL.md](../map-plugins-index/SKILL.md) |
| 宿主契约 Skill | [../map-plugins-pack/map-workspace-host-react/SKILL.md](../map-plugins-pack/map-workspace-host-react/SKILL.md) |

**不要**与 `cloud/uav` ESM 远程模块混用 — 后者见 Skill `cloud-uav-esm-plugin`。

## 边界：谁负责什么

| 层 | 职责 | 路径 |
| --- | --- | --- |
| **UI 状态** | 哪个工具打开、URL 深链 | `features/map-workspace/model/workspace-store.ts` |
| **UI 载体** | React 浮层 / L4 条带 | `widgets/map-tool-host`、`map-import-drawer` |
| **Bridge** | 通知地图引擎启停插件 | `features/map-workspace/lib/map-plugin-bridge.ts` |
| **Registry** | 已知 `pluginToolId` 登记 | `features/map-workspace/lib/map-plugin-registry.ts` |
| **Lifecycle** | store → bridge 同步 | `features/map-workspace/ui/map-tool-lifecycle-sync.tsx` |
| **MapProvider** | 注入真实 bridge、lazy import plugins | 待接（packages-map） |

**规则**：菜单点击只改 **store**；`MapToolLifecycleSync` 监听 store 再调 **bridge**。不要在 `handle-nav-select` 或 widget 里直接调 `startMapTool`。

## Bridge 契约

```ts
interface MapPluginBridge {
  startMapTool: (tool: ActiveMapTool) => void
  stopMapTool: () => void
  showDrawerTool: (tool: ActiveDrawerTool) => void
  hideDrawerTool: () => void
}
```

| API | 用途 |
| --- | --- |
| `setMapPluginBridge(bridge)` | MapProvider 初始化时注入；触发 `map-engine-ready` |
| `getMapPluginBridge()` | 读取当前 bridge |
| `isMapEngineReady()` | bridge 已注入或 `VITE_MAP_ENGINE_READY=true` |
| `createDevMapPluginBridge()` | DEV 占位（registry 校验 + console） |

当前 `MapToolLifecycleSync` 在 mount 时设 dev bridge；**Phase C** 改为 MapProvider 调用 `setMapPluginBridge(realBridge)`，并移除 dev 覆盖。

## Store ↔ Bridge 映射

| store 字段 | bridge 调用 | UI 载体 |
| --- | --- | --- |
| `activeMapTool` | `startMapTool` / `stopMapTool` | `MockMapToolHost` |
| `activeDrawerTool` | `showDrawerTool` / `hideDrawerTool` | `MapToolDrawerPanel` |
| `activePanelTools[]` | 按插件契约扩展（当前 dev bridge 未单独分发） | 并行 panel 浮层 |
| Dock / module 字段 | **不调 bridge** | `MapDockPanel` / `MapBusinessDock` |

`activePanelTools` 与 `activeMapTool` 可并存；drawer 与 map tool 互斥 — 见 `workspace-store.test.ts`。

## 接入 MapProvider（Phase C checklist）

1. 实现 `realBridge`：`startMapTool` 内 lazy import 对应 `map-plugins` entry
2. MapProvider 就绪后 `setMapPluginBridge(realBridge)`（勿在 widget 重复注入）
3. `stopMapTool` / `hideDrawerTool` 清理 overlay 与插件状态
4. 新工具：在 `mock-nav-items` 设 `pluginToolId` + `map-plugin-registry.ts` 登记
5. URL 深链：`workspace-url.ts` 已支持 `?tool=`；bridge 须能 restore 同一 `pluginToolId`
6. 单测：`workspace-url.test.ts`、`workspace-store.test.ts`；改 bridge 行为加 lifecycle 测试
7. UI 变更仍遵守 Skill `map-workspace-ui`

## 新增 pluginToolId

1. `entities/navigation` mock 项配置 `pluginToolId`（对齐 packages-map 常量）
2. `MAP_PLUGIN_TOOL_REGISTRY` 增加条目 + variants（如有）
3. DEV 下未知 id 会 `console.warn` — 跑一遍工具切换验证

## 禁止

- 在 `handle-nav-select` 直接调用 bridge（破坏 store 单一数据源）
- 把 Cloud UAV `mount`/`unmount` 逻辑放进 map-plugin-bridge
- 为 Dock 模块调用 `startMapTool`（纯 React UI）
- 跳过 registry 登记新增 `pluginToolId`（DEV 无法发现错配）

## 验证

```bash
pnpm --filter @repo/saas-web test
pnpm --filter @repo/saas-web validate
```
