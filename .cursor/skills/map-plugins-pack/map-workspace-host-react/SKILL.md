---
name: map-workspace-host-react
description: >-
  React 地图工作台宿主契约：多 mapId、工具互斥、Modify 面板槽位、插件注册与生命周期。
  任意 React 地图项目实现地图插件前必读；未接入 @haoxuan/map-core 时按本 skill 的 HostCapabilities 接口实现。
---

# React 地图工作台宿主契约

> **用途**：其它 React 项目拷贝 `map-plugin-*` skill 时，先读本 skill，再读具体插件 skill。  
> **云眼默认实现**：`@haoxuan/map-core` + Vue `map-plugins`（见各 skill 附录，非必需）。

---

## 1. 核心概念

| 概念 | 说明 |
|------|------|
| **mapId** | 同一页面多地图实例的唯一键；插件状态、显隐、图层均按 mapId 隔离 |
| **HostCapabilities** | 宿主注入的能力集合（见 §3） |
| **Coordinator** | 工具互斥：同一 mapId 同时仅一个「绘制/测量/标绘」类工具激活 |
| **Modify 互斥组** | 做分析 / 属性查看 / 收藏夹 / 导入文件 / 跳转报告等右栏面板互斥 |
| **并行面板** | 机库、专题图层、飞行数据等：不与绘制工具互斥 |
| **toolId** | 插件在 Coordinator / 插件注册表中的字符串 ID（见 [reference.md](reference.md) 常量表） |

---

## 2. 插件类型与宿主行为

| 类型 | 互斥 | 典型 UI | 生命周期 |
|------|------|---------|----------|
| **tool** | Coordinator | 工具栏 + Overlay + 右 Modify | start → register → stop → unregister → destroy |
| **display** | 无 | 工具栏/卡片 + 图层 | show/hide → 图层显隐 → destroy |
| **map-chrome** | 无 | 地图角落控件 | 挂载/卸载 |
| **modify-panel** | Modify 组 | 右栏 420px 抽屉 | open 前 closeSiblingModifyPanelsExcept |
| **parallel-panel** | 无 | 右栏抽屉 + 地图叠加 | visible 同步清理图层 |
| **hybrid** | 通常无 | Entry 内 new Core / 下拉 | 首次交互实例化 → destroy |
| **cesium-toolkit** | 组内互斥 | 三维工具条 | 仅 Cesium 宿主 |

选型索引：[`map-plugins-index`](../map-plugins-index/SKILL.md)

---

## 3. HostCapabilities（宿主必须或建议提供）

在 React 项目中定义接口（名称可自定，语义对齐即可）：

```typescript
/** 按 mapId 隔离的地图宿主能力 */
export interface MapHostCapabilities {
  mapId: string

  /** 二维：OpenLayers Map；三维：Cesium Viewer — 至少一种 */
  getMapEngine(): "ol" | "cesium"

  /** 视图：fitExtent、setCenter、getViewState、restoreInitialExtent */
  mapView: {
    fitExtent(extent: number[], options?: { padding?: number[] }): void
    setCenter(lon: number, lat: number, zoom?: number): void
    getViewState(): { center: [number, number]; zoom: number }
  }

  /** 底图：切换影像/矢量、注册子模块显隐 API */
  baseMap?: {
    setVecVisible(visible: boolean): void
    registerModuleApi(toolId: string, api: { setVisible: (v: boolean) => void }): void
  }

  /** 工具互斥协调器 */
  coordinator: {
    register(toolId: string, onDeactivate: () => void): void
    unregister(toolId: string): void
    deactivateExcept(activeToolId: string): void
  }

  /** 插件注册：lazyEntry / descriptor 挂载点 */
  pluginsManage: {
    setPlugins(entry: PluginLazyEntry): void
    ensureLoaded(toolId: string): Promise<void>
    getPlugins<T>(toolId: string): T | undefined
  }

  /** 按 mapId 的 Modify 显隐 ref + 关闭兄弟面板 */
  modifyPanels: {
    getVisibleRef(toolId: string): { value: boolean }
    closeSiblingExcept(exceptToolId: string): void
  }

  /** 目录标绘统一矢量层（标绘类插件写入） */
  catalogPlotLayer?: {
    getOrCreateSource(): unknown
    registerStyleResolver(toolId: string, resolver: CatalogStyleResolver): void
  }

  /** 事件总线（可选）：插件 Overlay 清除前通知 */
  pluginEventBus?: { emit(event: string, payload?: unknown): void }

  /** 权限门控（可选，云眼 Ruoyi 权限码可替换为自有 RBAC） */
  permissions?: { can(code: string): boolean }
}
```

### Provider 模式（推荐）

```tsx
<MapHostProvider mapId={mapId} capabilities={capabilities}>
  <MapCanvas />
  <PluginToolbar />
</MapHostProvider>
```

插件 hook：`const caps = useMapHost()`，**禁止**全局单例跨 mapId。

---

## 4. 插件标准生命周期

### 4.1 工具类（tool）

```
ensureLoaded(toolId)
  → setPlugins(lazyEntry)
  → 用户点击工具栏 Entry
  → start(): coordinator.register(toolId, stop)
  → 绘制/测量交互
  → stop() 或切换工具: coordinator.unregister + clear 绘制态
  → 卸载: destroy() + 清理图层/监听
```

### 4.2 Modify 面板类（modify-panel）

```
用户打开面板
  → modifyPanels.closeSiblingExcept(thisToolId)
  → visibleRef.value = true
  → 挂载 Modify 组件（宽 420px）
关闭 → visibleRef.value = false
```

### 4.3 展示类（display）

```
Entry 挂载 → core 创建图层 → setVisible(true/false)
卸载 → removeLayer + dispose 监听
不与 coordinator 冲突
```

---

## 5. UI 槽位约定

| 槽位 | 尺寸/位置 | 用途 |
|------|-----------|------|
| 工具栏 | 地图顶部/侧边 | ActionBarItem、FunctionCard |
| 右 Modify | 宽 **420px** | 属性、列表、做分析、机库主面板 |
| 左 Modify | 宽 **40%** 或 LeftBar | 卷帘对比参数、部分工具 |
| 地图控件 | 角落 overlay | 指北针、比例尺、缩放、底图切换 |
| 多路直播等 | 左 **40%** 独立抽屉 | 机库多路直播（见 uav-workspace-react） |

---

## 6. 插件间协作（禁止跨目录 import）

| 方式 | 说明 |
|------|------|
| `pluginsManage.getPlugins(toolId)` | 获取其它插件 descriptor API |
| `modifyPanels.closeSiblingExcept` | Modify 互斥 |
| `pluginEventBus` | 如目录标绘清除前关编辑面板 |
| `baseMap.registerModuleApi` | 底图切换注册子模块 setVisible |
| 共享 hook 契约 | 如专题图层 `getCheckedTopicIdsRef(mapId)` — 在宿主或 shared 包定义 |

---

## 7. React 项目落地 Checklist

- [ ] 定义 `MapHostCapabilities` 并与地图引擎对接
- [ ] 实现 `Coordinator`（单 mapId 一个实例）
- [ ] 实现 `modifyPanels.closeSiblingExcept`（modify-panel 互斥组）
- [ ] 工具栏/Modify 槽位与 420px 右栏一致
- [ ] `toolIds` 常量表与 skill 内嵌 ID 对齐（见 reference.md）
- [ ] 每插件 feature 目录：`hooks/` + `components/` + `core/`（纯 TS 可单测）
- [ ] 在 `.cursor/rules/map-host.mdc` 声明本项目宿主实现路径

---

## 8. 不要做的事

- 不要用应用级单例代替 per-mapId 状态
- 不要硬编码 toolId 字符串（用常量表）
- 不要绕过 Coordinator 启动第二个绘制工具
- 不要对目录标绘统一源 `clear()` 当取消预览（按 file_id 移除要素）
- 未使用云眼 monorepo 时，**不必**引入 `@haoxuan/map-core` — 按本契约自建薄适配层即可

---

## 延伸阅读

- [reference.md](reference.md) — toolId 全表、Modify 互斥组、云眼 API 对照
- [map-plugins-index](../map-plugins-index/SKILL.md) — 全部插件 skill
- [uav-workspace-react](../uav-workspace-react/SKILL.md) — 并行面板 + 双宿主完整范例
