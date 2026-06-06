---
name: map-plugin-measure-distance
description: >-
  React 地图「测距：折线顶点、双击完成、显示地理距离」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：测距：折线顶点、双击完成、显示地理距离

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `measure-distance-plugin`（`MEASURE_DISTANCE_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

测距：折线顶点、双击完成、显示地理距离

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- style.ts: 测距样式：线段、顶点、距离文字 参考 OpenLayers 官方 measure-style 示例：https://openlayers.org/en/latest/examples/measure-style.html

### 产品规格摘要

### 1. 插件概述

| 项           | 填写                                                  |
| ------------ | ----------------------------------------------------- |
| **插件名**   | `measureDistance-plugin`                               |
| **用途**     | 测距插件：点击地图添加顶点，双击完成，显示地理距离     |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core    |
| **参考模板** | demo-plugin                                           |

---

### 2. 必选能力

- [x] 点击地图添加顶点，形成折线
- [x] 双击完成当前测距
- [x] 使用 ol/sphere.getLength 计算地理距离（米/千米）
- [x] 点击已完成测距线显示距离与删除
- [x] 通过 Coordinator 实现与其他插件的互斥
- [x] 懒加载入口（createMeasureDistancePluginLazyEntry）供宿主按需加载

---

### 3. 技术约束

### 文件与职责

| 路径                                  | 职责                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `core/MeasureDistance.ts`             | 主类，继承 BasePlugins；点击添加顶点，双击完成，LineString   |
| `core/style.ts`                       | 测距线样式：线段 + 顶点圆                                    |
| `descriptor/descriptor.ts`            | createMeasureDistancePluginDescriptor(deps)，register/unregister |
| `lazyEntry/lazyEntry.ts`              | createMeasureDistancePluginLazyEntry()                        |
| `hooks/useMeasureDistance.ts`         | useMeasureDistance(deps)，桥接 UI 与 descriptor               |
| `widgets/MeasureDistanceEntry.vue`    | 入口 UI（ActionBarItem、ActionExit）                        |
| `widgets/MeasureDistancePanel.vue`    | 测距结果面板（距离 + 删除）                              …

### 4. 可选能力（先询问后再实现）

- [ ] 支持面积测量
- [ ] 测距线样式配置

---

### 5. 执行约束（How）

Definition of Done、When Blocked、边界等**操作约束**详见 [AGENTS.md](./AGENTS.md) 对应章节。

---

### 行为详述

点击添加顶点 → 双击完成 LineString → ol/sphere.getLength 显示 m/km → 点击已有线显示 Panel（距离+删除）。Coordinator 互斥。

### React 架构建议

src/features/measure-distance/ — core/MeasureDistance.ts（纯 TS 可单测 sphere.getLength）

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useMeasureDistance(caps)` | `useMeasureDistance()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/measure-distance/
├── core/
├── hooks/useMeasureDistance.ts
├── components/
│   ├── MeasureDistanceEntry.tsx
│   ├── MeasureDistancePanel.tsx
│   └── MeasureDistanceModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`measure-distance-plugin`（常量建议名 `MEASURE_DISTANCE_PLUGIN_TOOL_ID`）
- [ ] useMeasureDistance：ensureLoaded → register；start/stop 走 coordinator
- [ ] Entry：工具栏项 + 退出
- [ ] Core：纯 TS，地图交互 + catalogPlotLayer（标绘类）
- [ ] Panel + Modify（属性/数据/样式/设置/工具 Tab）
- [ ] 单测 core 纯逻辑

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `coordinator` | 测距互斥 | MEASURE_DISTANCE_PLUGIN_TOOL_ID |
| `ol/sphere.getLength` | 地理距离 | core 纯函数可单测 |

---

## 4. 插件协作

- **toolId**：`measure-distance-plugin` · 常量 `MEASURE_DISTANCE_PLUGIN_TOOL_ID`


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
