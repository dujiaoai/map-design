---
name: map-plugin-locate-map-point
description: >-
  React 地图「地图定点定位」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：地图定点定位（输入坐标定位）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `locate-map-point-plugin`（`LOCATE_MAP_POINT_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

地图定点定位（输入坐标定位）

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- 与 pick-map-point 类似 start/stop 互斥工具
- 输入经纬度后地图定位

### 行为详述

用户输入经纬度 → 校验 → setCenter/fit 定位；可选标记点图层。start/stop 互斥工具链。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useLocateMapPoint(caps)` | `useLocateMapPoint()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/locate-map-point/
├── core/
├── hooks/useLocateMapPoint.ts
├── components/
│   ├── LocateMapPointEntry.tsx
│   ├── LocateMapPointPanel.tsx
│   └── LocateMapPointModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`locate-map-point-plugin`（常量建议名 `LOCATE_MAP_POINT_PLUGIN_TOOL_ID`）
- [ ] useLocateMapPoint：ensureLoaded → register；start/stop 走 coordinator
- [ ] Entry：工具栏项 + 退出
- [ ] Core：纯 TS，地图交互 + catalogPlotLayer（标绘类）
- [ ] Panel + Modify（属性/数据/样式/设置/工具 Tab）
- [ ] 单测 core 纯逻辑

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `coordinator.register/unregister` | 工具激活/切换互斥 | deps.coordinator |
| `pluginsManage.ensureLoaded` | 懒加载 descriptor | deps.pluginsManage |
| `catalogPlotLayer` | 标绘类写入统一矢量源 | BaseOlMap.getOrCreateCatalogPlotLayer() |
| `modifyPanels.getVisibleRef` | Modify 抽屉显隐 | visibleRef(mapId) |

---

## 4. 插件协作

- **toolId**：`locate-map-point-plugin` · 常量 `LOCATE_MAP_POINT_PLUGIN_TOOL_ID`


- **Coordinator**：与其它绘制/测量工具互斥
- 跨插件协作：`pluginsManage.getPlugins(toolId)`，禁止跨 feature 目录 import

---

## 不要做的事

- 不要跨插件 feature 目录互相 import
- 不要硬编码 toolId 字符串
- 不要绕过 Coordinator（工具类）
- 不要用全局单例代替 per-mapId 状态


---

## 延伸阅读

- [reference.md](reference.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
