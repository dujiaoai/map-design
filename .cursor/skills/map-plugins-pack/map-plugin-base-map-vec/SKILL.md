---
name: map-plugin-base-map-vec
description: >-
  React 地图「电子地图与影像底图互斥切换」能力（类型 map-chrome）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：电子地图与影像底图互斥切换

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`map-chrome`

---

## 1. 产品契约

### 定位

电子地图与影像底图互斥切换

### 边界规则

| 地图控件 | 挂载在地图容器角落，无 Modify |
| 无互斥 | 不参与 Coordinator |
| 轻量 | 调用宿主 baseMap / mapView API |

### 功能要点

- 电子地图 vec_w 与影像 img_w 互斥
- baseMapSwitcherRegisterViewModuleApi 注册
- 不创建图层，仅调 BaseOlMap.setBaseLayerVecActive
- 不在插件内请求接口、不创建图层、不做 WMTS 拼接。
- 不跨插件目录 `import`（仅依赖 `@haoxuan/map-core`、`vue` 等公共依赖）。
- 不修改底图切换面板逻辑（`base-map-switcher-plugin`）。
- 不在插件内直接 watch `baseMapSwitcherViewActiveMap` 并写图层（避免与 switcher 双通道）。

### 行为详述

vec 与 img 天地图底图互斥；调用宿主 setBaseLayerVecActive(true/false)，不在插件内新建 WMTS。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useBaseMapVec(caps)` | `useBaseMapVec()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/base-map-vec/
├── hooks/useBaseMapVec.ts
├── components/BaseMapVecEntry.tsx
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
| `baseMap.setBaseLayerVecActive` | vec/img 互斥 | BaseOlMap.setBaseLayerVecActive |
| `baseMap.registerModuleApi` | 底图切换面板注册 | baseMapSwitcherRegisterViewModuleApi |

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
