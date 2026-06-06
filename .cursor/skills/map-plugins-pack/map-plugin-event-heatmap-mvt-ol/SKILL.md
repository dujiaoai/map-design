---
name: map-plugin-event-heatmap-mvt-ol
description: >-
  React 地图「事件热力图 MVT 矢量瓦片图层」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：事件热力图 MVT 矢量瓦片图层（OpenLayers）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display` · **toolId** `event-heatmap-mvt-ol-plugin`（`HEATMAP_MVT_OL_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

事件热力图 MVT 矢量瓦片图层（OpenLayers）

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- 事件热力图 MVT 矢量瓦片（OpenLayers）
- HEATAMAP_MVT_OL_PLUGIN_TOOL_ID
- 图层显隐与样式
- HeatmapMvtOl.ts: MVT 热力图 OL 插件核心（BasePlugins）
- HeatmapMvtWebGLLayer.ts: 自定义 WebGLVectorTileLayer 子类：注入 postProcesses 实现「splat + gradient post-pass」。 OL 10.6 内置的 `ol/layer/WebGLVectorTile` 不向外透出 `postProcesses` 入参；但其基类

### 行为详述

MVT 矢量瓦片热力图层；toolId HEATMAP_MVT_OL_PLUGIN_TOOL_ID；setVisible 控制显隐。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useHeatmapMvtOl(caps)` | `useEventHeatmapMvtOl()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/event-heatmap-mvt-ol/
├── hooks/useEventHeatmapMvtOl.ts
├── components/EventHeatmapMvtOlEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] useEventHeatmapMvtOl：show/toggle/setVisible/destroy
- [ ] Entry 挂载到宿主工具栏或控件区
- [ ] 图层 create/destroy 与 mapId 生命周期绑定
- [ ] 无 Modify 则仅 Entry + core

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `mapView.fitExtent` | 定位/缩放至数据范围 | deps.mapApi |
| `permissions.can` | 功能卡片门控（可选） | Ruoyi 权限码 |

---

## 4. 插件协作

- **toolId**：`event-heatmap-mvt-ol-plugin` · 常量 `HEATMAP_MVT_OL_PLUGIN_TOOL_ID`



- 跨插件协作：`pluginsManage.getPlugins(toolId)`，禁止跨 feature 目录 import

---

## 不要做的事

- 不要跨插件 feature 目录互相 import
- 不要硬编码 toolId 字符串

- 不要用全局单例代替 per-mapId 状态


---

## 延伸阅读

- [reference.md](reference.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
