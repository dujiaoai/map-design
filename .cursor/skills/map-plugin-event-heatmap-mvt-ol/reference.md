# event-heatmap-mvt-ol-plugin — 契约参考

## 概述

事件热力图 MVT 矢量瓦片图层（OpenLayers）

| 属性 | 值 |
|------|-----|
| 类型 | display |
| toolId | `event-heatmap-mvt-ol-plugin` |
| 常量名 | `HEATMAP_MVT_OL_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

MVT 矢量瓦片热力图层；toolId HEATMAP_MVT_OL_PLUGIN_TOOL_ID；setVisible 控制显隐。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `mapView.fitExtent` | 定位/缩放至数据范围 | deps.mapApi |
| `permissions.can` | 功能卡片门控（可选） | Ruoyi 权限码 |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
