---
name: map-plugin-scenic-spots
description: >-
  React 地图「全景点位聚类展示与详情」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：全景点位聚类展示与详情

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display` · **toolId** `scenic-spots-plugin`（`SCENIC_SPOTS_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

全景点位聚类展示与详情

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- 全景点位 Cluster 聚类图层
- getListOld 拉取数据；inject currentRegionDm
- 点击聚类放大、单点打开详情

### 行为详述

getListOld 按 currentRegionDm 拉取 → Cluster 图层 → 点击聚类 zoom in / 单点详情弹层。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useScenicSpots(caps)` | `useScenicSpots()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/scenic-spots/
├── hooks/useScenicSpots.ts
├── components/ScenicSpotsEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] useScenicSpots：show/toggle/setVisible/destroy
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

- **toolId**：`scenic-spots-plugin` · 常量 `SCENIC_SPOTS_PLUGIN_TOOL_ID`



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
