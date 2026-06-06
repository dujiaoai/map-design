# locate-map-point-plugin — 契约参考

## 概述

地图定点定位（输入坐标定位）

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `locate-map-point-plugin` |
| 常量名 | `LOCATE_MAP_POINT_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

用户输入经纬度 → 校验 → setCenter/fit 定位；可选标记点图层。start/stop 互斥工具链。

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
