---
name: map-plugin-base-map-switcher-cesium
description: >-
  React 地图「Cesium 三维底图切换面板」能力（类型 map-chrome）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：Cesium 三维底图切换面板

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`map-chrome`

---

## 1. 产品契约

### 定位

Cesium 三维底图切换面板

### 边界规则

| 地图控件 | 挂载在地图容器角落，无 Modify |
| 无互斥 | 不参与 Coordinator |
| 轻量 | 调用宿主 baseMap / mapView API |

### 功能要点

- widgets 子模块切换影像/地形等
- 与二维 base-map-switcher 概念对齐

### 行为详述

Cesium 宿主底图切换 widgets；影像/地形等 layer 切换，概念对齐二维底图面板。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useBaseMapVecCesium(caps)` | `useBaseMapSwitcherCesium()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/base-map-switcher-cesium/
├── hooks/useBaseMapSwitcherCesium.ts
├── components/BaseMapSwitcherCesiumEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] Entry 挂载到地图控件区
- [ ] 调用宿主 mapView / baseMap API，避免重复实现底图逻辑
- [ ] 无 Coordinator / 无 Modify

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `baseMap.setVecVisible / registerModuleApi` | 底图与子模块联动 | BaseOlMap / baseMapSwitcherRegisterViewModuleApi |
| `mapView` | 缩放、指北、恢复范围 | deps.mapApi |

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
