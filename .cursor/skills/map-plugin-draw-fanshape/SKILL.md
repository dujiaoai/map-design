---
name: map-plugin-draw-fanshape
description: >-
  React 地图「画扇形：圆心 + 半径边 + 弧度边」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：画扇形：圆心 + 半径边 + 弧度边

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `draw-fanshape-plugin`（`DRAW_FANSHAPE_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

画扇形：圆心 + 半径边 + 弧度边

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- style.ts: 扇形绘制样式：填充、边线、顶点、扇形内角度标签 几何：Polygon，圆心 + 圆弧上的点 + 闭合回圆心

### 产品规格摘要

### 1. 插件概述

| 项           | 填写                                                  |
| ------------ | ----------------------------------------------------- |
| **插件名**   | `draw-fanshape-plugin`                                 |
| **用途**     | 画扇形插件：三点确定扇形（圆心、半径、弧度），支持半透明填充   |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core     |
| **参考**     | https://xinzhi.space/map/、measure-area-plugin         |

---

### 2. 必选能力

- [x] 第一步点击确定圆心
- [x] 第二步点击确定半径（扇形第一条边）
- [x] 第三步点击确定扇形弧度（第二条边），完成绘制
- [x] 绘制过程显示实时预览（圆心→半径线、完整扇形）
- [x] 点击已完成扇形显示操作面板
- [x] 支持整体平移、顶点修改
- [x] 通过 Coordinator 实现与其他插件的互斥
- [x] 懒加载入口（createDrawFanShapePluginLazyEntry）供宿主按需加载

---

### 3. 技术约束

### 文件与职责

| 路径                                  | 职责                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `core/DrawFanShape.ts`                | 主类，三步绘制、扇形 Polygon 生成、编辑                      |
| `core/style.ts`                       | 扇形样式（填充、边线、顶点）                                 |
| `descriptor/descriptor.ts`            | createDrawFanShapePluginDescriptor(deps)                     |
| `lazyEntry/lazyEntry.ts`              | createDrawFanShapePluginLazyEntry()                           |
| `hooks/useDrawFanShape.ts`            | useDrawFanShape(deps)，桥接 UI 与 descriptor                 |
| `widgets/DrawFanShapeEntry.vue`       | 入口 UI（ActionBarItem、ActionExit）                         |
| `widgets/DrawFanShapePanel.vue`       | 操作面板（拖拽、平移）                                     …

### 4. 功能交互

- 第一步：点击地图确定圆心
- 第二步：点击确定半径（第一条边）
- 第三步：点击确定弧度（第二条边），完成扇形
- 点击已完成扇形显示操作面板
- 扇形可整体平移、顶点可修改

---

### 5. 执行约束（How）

Definition of Done、When Blocked、边界等**操作约束**详见 [AGENTS.md](./AGENTS.md) 对应章节。

### 行为详述

三步点击 → createSectorRing；支持顶点编辑与 Panel 平移。

### React 架构建议

src/features/draw-fanshape/ — createSectorRing + 顶点编辑

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useDrawFanShape(caps)` | `useDrawFanshape()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/draw-fanshape/
├── core/
├── hooks/useDrawFanshape.ts
├── components/
│   ├── DrawFanshapeEntry.tsx
│   ├── DrawFanshapePanel.tsx
│   └── DrawFanshapeModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`draw-fanshape-plugin`（常量建议名 `DRAW_FANSHAPE_PLUGIN_TOOL_ID`）
- [ ] useDrawFanshape：ensureLoaded → register；start/stop 走 coordinator
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

- **toolId**：`draw-fanshape-plugin` · 常量 `DRAW_FANSHAPE_PLUGIN_TOOL_ID`


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
