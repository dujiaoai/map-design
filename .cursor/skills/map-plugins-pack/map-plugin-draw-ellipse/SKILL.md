---
name: map-plugin-draw-ellipse
description: >-
  React 地图「画椭圆：圆心 + 长轴 + 短轴三点」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：画椭圆：圆心 + 长轴 + 短轴三点

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `draw-ellipse-plugin`（`DRAW_ELLIPSE_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

画椭圆：圆心 + 长轴 + 短轴三点

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- style.ts: 椭圆绘制样式：填充、边线、半径线及距离 几何：Polygon，椭圆边界采样点闭合

### 产品规格摘要

### 1. 插件概述

| 项           | 填写                                                  |
| ------------ | ----------------------------------------------------- |
| **插件名**   | `draw-ellipse-plugin`                                 |
| **用途**     | 画椭圆插件：三点确定椭圆（圆心、长轴端点、短轴端点），支持半透明填充   |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core     |
| **参考**     | https://xinzhi.space/map/、measure-area-plugin、draw-fanshape-plugin |

---

### 2. 必选能力

- [x] 第一步点击确定圆心
- [x] 第二步点击确定长轴端点（半长轴方向与长度）
- [x] 第三步点击确定短轴端点（短半轴 = 第三点到长轴线的垂直距离），完成绘制
- [x] 绘制过程显示实时预览（圆心→长轴线、完整椭圆）
- [x] 点击已完成椭圆显示操作面板
- [x] 支持整体平移
- [x] 通过 Coordinator 实现与其他插件的互斥
- [x] 懒加载入口（createDrawEllipsePluginLazyEntry）供宿主按需加载

---

### 3. 技术约束

### 文件与职责

| 路径                                  | 职责                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `core/DrawEllipse.ts`                | 主类，三步绘制、椭圆 Polygon 生成、编辑                      |
| `core/style.ts`                       | 椭圆样式（填充、边线）                                       |
| `descriptor/descriptor.ts`            | createDrawEllipsePluginDescriptor(deps)                     |
| `lazyEntry/lazyEntry.ts`              | createDrawEllipsePluginLazyEntry()                           |
| `hooks/useDrawEllipse.ts`            | useDrawEllipse(deps)，桥接 UI 与 descriptor                 |
| `widgets/DrawEllipseEntry.vue`       | 入口 UI（ActionBarItem、ActionExit）                         |
| `widgets/DrawEllipsePanel.vue`       | 操作面板（拖拽、平移）                                       |
…

### 4. 功能交互

- 第一步：点击地图确定圆心
- 第二步：点击确定长轴端点
- 第三步：点击确定短轴端点，完成椭圆
- 点击已完成椭圆显示操作面板
- 椭圆可整体平移

---

### 5. 执行约束（How）

Definition of Done、When Blocked、边界等**操作约束**详见 [AGENTS.md](./AGENTS.md) 对应章节。

### 行为详述

三步点击 → createEllipseRing；Modify 数据 Tab 为椭圆参数表（非折点表）。

### React 架构建议

src/features/draw-ellipse/ — 三步点击采样 + createEllipseRing

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useDrawEllipse(caps)` | `useDrawEllipse()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/draw-ellipse/
├── core/
├── hooks/useDrawEllipse.ts
├── components/
│   ├── DrawEllipseEntry.tsx
│   ├── DrawEllipsePanel.tsx
│   └── DrawEllipseModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`draw-ellipse-plugin`（常量建议名 `DRAW_ELLIPSE_PLUGIN_TOOL_ID`）
- [ ] useDrawEllipse：ensureLoaded → register；start/stop 走 coordinator
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

- **toolId**：`draw-ellipse-plugin` · 常量 `DRAW_ELLIPSE_PLUGIN_TOOL_ID`


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
