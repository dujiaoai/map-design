---
name: map-plugin-base-map-switcher
description: >-
  React 地图「右下角底图切换：正射/电子地图/全景漫游与区划路网复选」能力（类型 map-chrome）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：右下角底图切换：正射/电子地图/全景漫游与区划路网复选

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`map-chrome`

---

## 1. 产品契约

### 定位

右下角底图切换：正射/电子地图/全景漫游与区划路网复选

### 边界规则

| 地图控件 | 挂载在地图容器角落，无 Modify |
| 无互斥 | 不参与 Coordinator |
| 轻量 | 调用宿主 baseMap / mapView API |

### 功能要点

- 底图切换面板：正射影像、电子地图、全景漫游卡片
- 复选：行政区划、路网
- useBaseMapSwitcher 模块注册 setVisible
- 权限门控 YUNKAN_MAP_ORTHOPHOTO_MAP_*

### 行为详述

| 卡片/复选 | 行为 |
|----------|------|
| 正射影像 | 调 ortho-imagery / 正射模块 setVisible |
| 电子地图 | base-map-vec 互斥切换 vec/img WMTS |
| 全景漫游 | panorama-roam 模块 |
| 行政区划/路网 | region-map / road-map registerModuleApi |

面板右下角弹出；registerModuleApi 注册子模块显隐。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useBaseMapSwitcher(caps)` | `useBaseMapSwitcher()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/base-map-switcher/
├── hooks/useBaseMapSwitcher.ts
├── components/BaseMapSwitcherEntry.tsx
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
| `baseMap.registerModuleApi` | 正射/电子地图/全景/区划/路网子模块 | useBaseMapSwitcher |
| `permissions.can` | 正射影像权限门控 | YUNKAN_MAP_ORTHOPHOTO_MAP_* |

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
