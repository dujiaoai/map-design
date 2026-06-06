---
name: map-plugin-panorama-roam
description: >-
  React 地图「全景漫游模块」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：全景漫游模块（底图切换卡片内）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display` · **toolId** `panorama-roam-plugin`（`PANORAMA_ROAM_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

全景漫游模块（底图切换卡片内）

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- 全景漫游入口/控制器
- 与 base-map-switcher PanoramaRoamController 配合

### 行为详述

底图切换面板「全景漫游」卡片激活本模块；PanoramaRoamController 控制漫游态与地图联动。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `usePanoramaRoam(caps)` | `usePanoramaRoam()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/panorama-roam/
├── hooks/usePanoramaRoam.ts
├── components/PanoramaRoamEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] usePanoramaRoam：show/toggle/setVisible/destroy
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

- **toolId**：`panorama-roam-plugin` · 常量 `PANORAMA_ROAM_PLUGIN_TOOL_ID`



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
