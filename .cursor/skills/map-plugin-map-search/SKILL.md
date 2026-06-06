---
name: map-plugin-map-search
description: >-
  React 地图「地图 POI/地址搜索与定位」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：地图 POI/地址搜索与定位

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `map-search-plugin`（`MAP_SEARCH_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

地图 POI/地址搜索与定位

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- 右侧搜索面板；activatePlugin + visibleRef
- 地址搜索 + 结果定位（widgets/address）
- ensureLoaded 后 register/setVisible
- MapSearch.ts: 地图搜索插件核心（BasePlugins） 负责工具显隐、Coordinator 与 modifyUI（左侧抽屉）；不向地图挂载业务图层。

### 行为详述

搜索框输入 → 地址/POI 结果列表 → 点击结果 mapView.fitExtent 定位。右侧面板或嵌入式 Panel。

### React 架构建议

src/features/map-search/ — useMapSearch + SearchModify + address widgets

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useMapSearch(caps)` | `useMapSearch()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/map-search/
├── core/
├── hooks/useMapSearch.ts
├── components/
│   ├── MapSearchEntry.tsx
│   ├── MapSearchPanel.tsx
│   └── MapSearchModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`map-search-plugin`（常量建议名 `MAP_SEARCH_PLUGIN_TOOL_ID`）
- [ ] useMapSearch：ensureLoaded → register；start/stop 走 coordinator
- [ ] Entry：工具栏项 + 退出
- [ ] Core：纯 TS，地图交互 + catalogPlotLayer（标绘类）
- [ ] Panel + Modify（属性/数据/样式/设置/工具 Tab）
- [ ] 单测 core 纯逻辑

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `mapView.fitExtent` | 搜索结果定位 | MAP_SEARCH_PLUGIN_TOOL_ID |

---

## 4. 插件协作

- **toolId**：`map-search-plugin` · 常量 `MAP_SEARCH_PLUGIN_TOOL_ID`


- **Coordinator**：与其它绘制/测量工具互斥
- 跨插件协作：`pluginsManage.getPlugins(toolId)`，禁止跨 feature 目录 import

---

## 不要做的事

- 不要跨插件 feature 目录互相 import
- 不要硬编码 toolId 字符串
- 不要绕过 Coordinator（工具类）
- 不要用全局单例代替 per-mapId 状态


---

## 延伸阅读

- [reference.md](reference.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
