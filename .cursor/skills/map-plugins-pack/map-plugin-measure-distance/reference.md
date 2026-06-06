# measure-distance-plugin — 契约参考

## 概述

测距：折线顶点、双击完成、显示地理距离

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `measure-distance-plugin` |
| 常量名 | `MEASURE_DISTANCE_PLUGIN_TOOL_ID` |
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

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `coordinator` | 测距互斥 | MEASURE_DISTANCE_PLUGIN_TOOL_ID |
| `ol/sphere.getLength` | 地理距离 | core 纯函数可单测 |

## 互斥与协作

- 工具类：Coordinator 互斥


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
