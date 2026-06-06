# ortho-imagery-comparison-plugin — 契约参考

## 概述

正射影像两期对比：工具互斥 + 双期卷帘/对比 UI

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `ortho-imagery-comparison-plugin` |
| 常量名 | `ORTHO_IMAGERY_COMPARISON_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

与 comparison-plugin（地图卷帘）不同：本插件聚焦**正射影像期数 A vs B** 的对比展示。激活时 register；退出时 destroy 双期图层。

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
