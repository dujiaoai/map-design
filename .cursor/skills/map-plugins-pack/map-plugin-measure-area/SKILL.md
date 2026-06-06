---
name: map-plugin-measure-area
description: >-
  React 地图「测面：多边形顶点、双击完成、显示地理面积」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：测面：多边形顶点、双击完成、显示地理面积

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `measure-area-plugin`（`MEASURE_AREA_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

测面：多边形顶点、双击完成、显示地理面积

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- style.ts: 测面样式：多边形边线、填充、顶点、面积文字；支持缓冲区背景

### 产品规格摘要

### 1. 插件概述

| 项           | 填写                                                  |
| ------------ | ----------------------------------------------------- |
| **插件名**   | `measure-area-plugin`                                  |
| **用途**     | 测面插件：点击地图添加顶点，双击完成，显示地理面积     |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core    |
| **参考模板** | measure-distance-plugin                               |

---

### 2. 必选能力

- [x] 点击地图添加顶点，形成多边形
- [x] 双击完成当前测面（至少 3 个顶点）
- [x] 使用 ol/sphere.getArea 计算地理面积（平方米/公顷/平方千米）
- [x] 点击已完成测面显示面积与删除
- [x] 通过 Coordinator 实现与其他插件的互斥
- [x] 懒加载入口（createMeasureAreaPluginLazyEntry）供宿主按需加载

---

### 3. 技术约束

### 文件与职责

| 路径                                  | 职责                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `core/MeasureArea.ts`                 | 主类，继承 BasePlugins；点击添加顶点，双击完成，Polygon      |
| `core/style.ts`                       | 测面样式：多边形填充 + 边线 + 顶点圆                         |
| `descriptor/descriptor.ts`            | createMeasureAreaPluginDescriptor(deps)，register/unregister |
| `lazyEntry/lazyEntry.ts`              | createMeasureAreaPluginLazyEntry()                           |
| `hooks/useMeasureArea.ts`             | useMeasureArea(deps)，桥接 UI 与 descriptor                  |
| `widgets/MeasureAreaEntry.vue`        | 入口 UI（ActionBarItem、ActionExit）                        |
| `widgets/MeasureAreaPanel.vue`        | 测面结果面板（面积 + 延续要素）                               |
| `wi…

### 4. 功能交互（与 measure-distance-plugin 一致）

- 点击地图添加顶点
- 双击完成
- 点击已完成要素显示操作面板
- 延续要素：从末尾继续添加顶点
- 面板可拖拽、要素可整体平移

---

### 5. 执行约束（How）

Definition of Done、When Blocked、边界等**操作约束**详见 [AGENTS.md](./AGENTS.md) 对应章节。

---

### 行为详述

≥3 顶点 Polygon → 双击完成 → getArea 显示 ㎡/公顷/k㎡ → Panel 可延续绘制。

### React 架构建议

src/features/measure-area/ — core + Modify 含 PluginVertexDataTable 折点 Tab

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useMeasureArea(caps)` | `useMeasureArea()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/measure-area/
├── core/
├── hooks/useMeasureArea.ts
├── components/
│   ├── MeasureAreaEntry.tsx
│   ├── MeasureAreaPanel.tsx
│   └── MeasureAreaModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`measure-area-plugin`（常量建议名 `MEASURE_AREA_PLUGIN_TOOL_ID`）
- [ ] useMeasureArea：ensureLoaded → register；start/stop 走 coordinator
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

- **toolId**：`measure-area-plugin` · 常量 `MEASURE_AREA_PLUGIN_TOOL_ID`


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
