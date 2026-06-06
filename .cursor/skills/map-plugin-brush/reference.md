# brush-plugin — 契约参考

## 概述

画笔：按住拖拽绘制自由路径

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `brush-plugin` |
| 常量名 | `BRUSH_PLUGIN_TOOL_ID` |
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
| **插件名**   | `brush-plugin`                                        |
| **用途**     | 自由手绘画笔：按住拖拽绘制路径（LineString），支持连续绘制 |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core    |
| **参考**     | [新知卫星地图](https://xinzhi.space/map/)              |

---

### 2. 必选能力

- [x] 按住鼠标左键拖拽绘制路径（自由手绘）
- [x] 绘制过程显示实时预览（虚线路径）
- [x] 连续绘制：完成一笔后可继续下一笔
- [x] 点击已完成路径显示操作面板
- [x] 支持整体平移（路径平移）
- [x] 面板无移动功能（固定于起点）
- [x] 通过 Coordinator 实现与其他插件的互斥
- [x] 懒加载入口（createBrushPluginLazyEntry）供宿主按需加载

---

### 3. 技术约束

### 文件与职责

| 路径                                  | 职责                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `core/Brush.ts`                       | 主类，pointer 拖拽采样、LineString 生成、编辑                 |
| `core/style.ts`                       | 画笔路径样式（线段、预览虚线）                                |
| `descriptor/descriptor.ts`            | createBrushPluginDescriptor(deps)                             |
| `lazyEntry/lazyEntry.ts`              | createBrushPluginLazyEntry()                                 |
| `hooks/useBrush.ts`                   | useBrush(deps)，桥接 UI 与 descriptor                        |
| `widgets/BrushEntry.vue`              | 入口 UI（ActionBarItem、ActionExit）                         |
| `widgets/BrushPanel.vue`              | 操作面板（路径平移）                                   …

### 4. 功能交互

- 按住左键拖拽：绘制路径，松开完成当前笔
- 连续绘制：完成一笔后可立即开始下一笔
- 点击已有路径：显示操作面板（长度、删除、平移）
- 路径可整体平移

---

### 5. 执行约束（How）

Definition of Done、When Blocked、边界等**操作约束**详见 [AGENTS.md](./AGENTS.md) 对应章节。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `coordinator` | 画笔互斥 | BRUSH_PLUGIN_TOOL_ID |
| `pointer 拖拽绘制` | LineString 采样 | core/Brush.ts |

## 互斥与协作

- 工具类：Coordinator 互斥


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
