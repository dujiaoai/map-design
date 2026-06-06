---
name: map-plugin-scale-bar
description: >-
  React 地图「数字比例尺」能力（类型 map-chrome）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：数字比例尺（1:N）控件

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`map-chrome`

---

## 1. 产品契约

### 定位

数字比例尺（1:N）控件

### 边界规则

| 地图控件 | 挂载在地图容器角落，无 Modify |
| 无互斥 | 不参与 Coordinator |
| 轻量 | 调用宿主 baseMap / mapView API |

### 功能要点

- 轻量 Entry：hooks + libs，无 lazyEntry/Coordinator
- ScaleLine + postrender 刷新文案
- formatScaleText 纯函数
- 右下角控件组，只读展示
- 根据地图视图分辨率显示数字比例尺（`1:N` / `N:1`）；
- 右下角控件组内的布局与视觉规格；
- 通过 OpenLayers `ScaleLine` 获取比例并刷新文案。
- 挂载时：向 `olMap` 添加 `ScaleLine`，`target` 指向隐藏 DOM，用于比例计算但不显示默认样式。
- 刷新时机：监听 `postrender`，每次渲染后更新比例尺文案。
- 异常兜底：`getScaleForResolution` 抛错时必须 `try/catch`，不阻断渲染。
- 卸载清理：解除 `postrender` 监听；建议同时 `removeControl` 成对移除控件。
- 禁止在本插件内发起业务 API 请求。
- 禁止跨插件源码路径 `import`。
- 禁止将实现或文档绑定到特定业务页面路径。

### 行为详述

挂载 ScaleLine（隐藏 target）→ postrender 更新 1:N 文案 → 卸载 removeControl + unlisten。**禁止**业务 API 请求。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useScaleBar(caps)` | `useScaleBar()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/scale-bar/
├── hooks/useScaleBar.ts
├── components/ScaleBarEntry.tsx
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
| `mapView.getMap` | ScaleLine + postrender | useScaleBar + ol ScaleLine |

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
