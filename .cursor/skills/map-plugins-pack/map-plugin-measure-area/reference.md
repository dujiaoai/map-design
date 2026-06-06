# measure-area-plugin — 契约参考

## 概述

测面：多边形顶点、双击完成、显示地理面积

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `measure-area-plugin` |
| 常量名 | `MEASURE_AREA_PLUGIN_TOOL_ID` |
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
