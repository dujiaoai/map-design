---
name: map-plugin-measure-angle
description: >-
  React 地图「测夹角：顶点处显示两线段夹角」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：测夹角：顶点处显示两线段夹角（度）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `measure-angle-plugin`（`MEASURE_ANGLE_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

测夹角：顶点处显示两线段夹角（度）

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- style.ts: 测夹角样式：折线、夹角圆弧、度数字样 几何：LineString 折线（至少 3 点），每个内部顶点仅显示两线段夹角 0–180°

### 产品规格摘要

### 1. 插件概述

| 项           | 填写                                                  |
| ------------ | ----------------------------------------------------- |
| **插件名**   | `measure-angle-plugin`                                |
| **用途**     | 测夹角插件：两条线之间的夹角，支持连续绘制，仅显示夹角度数（°）     |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core     |
| **参考模板** | measure-distance-plugin                                |

---

### 2. 必选能力

- [x] 点击添加顶点，双击完成（至少 3 个顶点形成夹角）
- [x] 每个顶点（除首尾）显示：两线段夹角度数（如 "90°"）
- [x] 支持延续要素：从末尾继续添加顶点，双击完成
- [x] 点击已完成要素显示操作面板
- [x] 通过 Coordinator 实现与其他插件的互斥
- [x] 懒加载入口（createMeasureAnglePluginLazyEntry）供宿主按需加载

---

### 3. 技术约束

### 文件与职责

| 路径                                  | 职责                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `core/MeasureAngle.ts`                | 主类，连续绘制、双击完成、夹角计算、延续要素                 |
| `core/style.ts`                       | 夹角计算、度数十方向格式化、线段样式                         |
| `descriptor/descriptor.ts`            | createMeasureAnglePluginDescriptor(deps)                     |
| `lazyEntry/lazyEntry.ts`               | createMeasureAnglePluginLazyEntry()                          |
| `hooks/useMeasureAngle.ts`           | useMeasureAngle(deps)，桥接 UI 与 descriptor                 |
| `widgets/MeasureAngleEntry.vue`       | 入口 UI（ActionBarItem、ActionExit）                         |
| `widgets/MeasureAnglePanel.vue`       | 操作面板（拖拽、平移、延续要素）                             |
| `widgets/Me…

### 4. 功能交互

- 点击地图添加顶点
- 双击完成（至少 3 点）
- 延续要素：从末尾继续添加顶点，双击完成
- 点击已完成要素显示操作面板
- 要素可整体平移、顶点可修改

---

### 5. 执行约束（How）

Definition of Done、When Blocked、边界等**操作约束**详见 [AGENTS.md](./AGENTS.md) 对应章节。

---

### 行为详述

≥3 顶点折线 → 内部顶点标注夹角（如 90°），不显示方位文字。

### React 架构建议

src/features/measure-angle/ — core/style.ts 夹角计算可单测；Panel 支持延续要素

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useMeasureAngle(caps)` | `useMeasureAngle()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/measure-angle/
├── core/
├── hooks/useMeasureAngle.ts
├── components/
│   ├── MeasureAngleEntry.tsx
│   ├── MeasureAnglePanel.tsx
│   └── MeasureAngleModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`measure-angle-plugin`（常量建议名 `MEASURE_ANGLE_PLUGIN_TOOL_ID`）
- [ ] useMeasureAngle：ensureLoaded → register；start/stop 走 coordinator
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

- **toolId**：`measure-angle-plugin` · 常量 `MEASURE_ANGLE_PLUGIN_TOOL_ID`


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
