---
name: map-plugin-zoom-control
description: >-
  React 地图「二维缩放 +/- 控件」能力（类型 map-chrome）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：二维缩放 +/- 控件

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`map-chrome`

---

## 1. 产品契约

### 定位

二维缩放 +/- 控件

### 边界规则

| 地图控件 | 挂载在地图容器角落，无 Modify |
| 无互斥 | 不参与 Coordinator |
| 轻量 | 调用宿主 baseMap / mapView API |

### 功能要点

- 放大/缩小按钮
- 调用 map view zoom
- 右下角控件组布局
- 地图缩放交互（放大一级、缩小一级）；
- 右下角控件区内的布局约束（位于最下方）；
- 与主题变量对齐的最小样式结构。
- 放大交互：读取当前缩放级别，目标值 `+1`，执行缩放（可带缓动动画）。
- 缩小交互：读取当前缩放级别，目标值 `-1`，执行缩放（可带缓动动画）。
- 无地图上下文时必须兜底：不执行缩放、不抛出未捕获异常，并输出可定位日志（开发环境）。
- 交互能力优先通过 `deps.mapApi` 抽象层调用；仅在必要时使用等价 `olMap` 能力。
- 禁止在本插件内发起业务 API 请求。
- 禁止将实现或文档绑定到特定业务页面路径（如 `apps/yunyan-web/src/views/map.vue` 专用写法）。
- 禁止跨插件源码路径 `import`。
- 产物必须位于 `packages-map` 范围内。

### 行为详述

点击 +/- 调用 mapView zoomIn/zoomOut；无 Coordinator。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useZoomControl(caps)` | `useZoomControl()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/zoom-control/
├── hooks/useZoomControl.ts
├── components/ZoomControlEntry.tsx
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
