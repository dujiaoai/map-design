---
name: map-plugin-scene-cesium
description: >-
  React 地图「Cesium 场景特效开关」能力（类型 cesium-toolkit）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：Cesium 场景特效开关（雨/雪/雾等）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`cesium-toolkit`

---

## 1. 产品契约

### 定位

Cesium 场景特效开关（雨/雪/雾等）

### 边界规则

| 仅 Cesium | 三维宿主专用 |
| 工具集 | 分析/量测/场景控件按需组合 |

### 功能要点

- SceneCesiumEntry：el-switch 网格
- useSceneSpecialEffects 控制 viewer 特效

### 行为详述

Entry 网格 switch 切换雨/雪/雾等；useSceneSpecialEffects 绑定 Cesium viewer 后处理。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useSceneCesium(caps)` | `useSceneCesium()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/scene-cesium/
├── hooks/useSceneCesium.ts
├── components/
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
| `Cesium viewer` | 三维场景/分析/量测 | IMapCesiumDeps |
| `coordinator（组内）` | 同组分析工具互斥 | deps.coordinator |

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
