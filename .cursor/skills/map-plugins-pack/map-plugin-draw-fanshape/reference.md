# draw-fanshape-plugin — 契约参考

## 概述

画扇形：圆心 + 半径边 + 弧度边

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `draw-fanshape-plugin` |
| 常量名 | `DRAW_FANSHAPE_PLUGIN_TOOL_ID` |
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
