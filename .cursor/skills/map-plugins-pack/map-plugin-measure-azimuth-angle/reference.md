# measure-azimuth-angle-plugin — 契约参考

## 概述

测方位角：夹角度数 + 东南西北方向

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `measure-azimuth-angle-plugin` |
| 常量名 | `MEASURE_AZIMUTH_ANGLE_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

### 1. 插件概述

| 项           | 填写                                                  |
| ------------ | ----------------------------------------------------- |
| **插件名**   | `measure-azimuth-angle-plugin`                         |
| **用途**     | 测方位角插件：两条线之间的夹角，支持连续绘制，显示度数与东南西北方向 |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core     |
| **参考模板** | measure-distance-plugin                                |

---

### 2. 必选能力

- [x] 点击添加顶点，双击完成（至少 3 个顶点形成夹角）
- [x] 每个顶点（除首尾）显示：两线段夹角度数 + 东南西北方向（如 "90° 东"）
- [x] 支持延续要素：从末尾继续添加顶点，双击完成
- [x] 点击已完成要素显示操作面板
- [x] 通过 Coordinator 实现与其他插件的互斥
- [x] 懒加载入口（createMeasureAzimuthAnglePluginLazyEntry）供宿主按需加载

---

### 3. 技术约束

### 文件与职责

| 路径                                  | 职责                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `core/MeasureAzimuthAngle.ts`         | 主类，连续绘制、双击完成、夹角计算、延续要素                 |
| `core/style.ts`                       | 夹角计算、度数十方向格式化、线段样式                         |
| `descriptor/descriptor.ts`            | createMeasureAzimuthAnglePluginDescriptor(deps)              |
| `lazyEntry/lazyEntry.ts`              | createMeasureAzimuthAnglePluginLazyEntry()                   |
| `hooks/useMeasureAzimuthAngle.ts`     | useMeasureAzimuthAngle(deps)，桥接 UI 与 descriptor           |
| `widgets/MeasureAzimuthAngleEntry.vue` | 入口 UI（ActionBarItem、ActionExit）                       |
| `widgets/MeasureAzimuthAnglePanel.vue` | 操作面板（拖拽、平移、延续要素）                             |
| `widgets/M…

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

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `coordinator.register/unregister` | 工具激活/切换互斥 | deps.coordinator |
| `pluginsManage.ensureLoaded` | 懒加载 descriptor | deps.pluginsManage |
| `catalogPlotLayer` | 标绘类写入统一矢量源 | BaseOlMap.getOrCreateCatalogPlotLayer() |
| `modifyPanels.getVisibleRef` | Modify 抽屉显隐 | visibleRef(mapId) |

## 互斥与协作

- 工具类：Coordinator 互斥


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
