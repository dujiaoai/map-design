---
name: map-plugin-road-map
description: >-
  React 地图「地名路网 WMTS 注记图层」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：地名路网 WMTS 注记图层

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display`

---

## 1. 产品契约

### 定位

地名路网 WMTS 注记图层

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- 路网图层显隐
- 与 base-map-switcher 路网复选联动
- 天地图影像注记 WMTS
- 调用 `getRegionRoadMapServer`（或宿主通过 props 覆盖的等价函数）读取 `roadMapServer` 配置；
- 使用 `@haoxuan/map-core` 的 `createLayerFromConfig` 创建**无区划裁剪**的瓦片图层并 `addLayer` 到 `OlMap`；
- 通过 `inject('baseMapSwitcherLayerActiveMap')` 与面板 `road` 勾选同步 `setVisible`。

### 行为详述

由 base-map-switcher 路网复选调用 registerModuleApi setVisible；独立 Entry 亦可显隐路网图层。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useRoadMapLayer(caps)` | `useRoadMap()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/road-map/
├── hooks/useRoadMap.ts
├── components/RoadMapEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] useRoadMap：show/toggle/setVisible/destroy
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
