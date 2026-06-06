---
name: map-plugin-region-map
description: >-
  React 地图「行政区划边界地图图层」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：行政区划边界地图图层

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display`

---

## 1. 产品契约

### 定位

行政区划边界地图图层

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- 行政区划边界图层
- 区划范围展示
- 与 base-map-switcher 区划复选联动
- 调用 `getRegionRoadMapServer` / `getUserBaseInfo`（或宿主通过 props 覆盖的等价函数），合并 `regionMapServer[0]` 与 **`boundary_cql`**；
- 使用 `@haoxuan/map-core` 的 `createLayerFromConfig`（接口常见 **`layerType: "GeoServer"`** → `ImageWMS` + `MapServerItem.cql` → `CQL_FILTER`，**`ratio`** 默认 1）创建图层并 `addLayer`；
- [`buildRegionMapLayerConfig`](./libs/buildRegionMapLayerConfig.ts) 合并接口项与 **`boundary_cql`**；
- 通过 `inject('baseMapSwitcherLayerActiveMap')` 与面板 **`region`** 勾选同步 `setVisible`。

### 行为详述

加载区划边界矢量/瓦片；base-map-switcher 行政区划复选联动 setVisible。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useRegionMapLayer(caps)` | `useRegionMap()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/region-map/
├── hooks/useRegionMap.ts
├── components/RegionMapEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] useRegionMap：show/toggle/setVisible/destroy
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

- **toolId**：无（展示/控件类可能不参与 Coordinator）



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
