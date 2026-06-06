# map-search-plugin — 契约参考

## 概述

地图 POI/地址搜索与定位

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `map-search-plugin` |
| 常量名 | `MAP_SEARCH_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

搜索框输入 → 地址/POI 结果列表 → 点击结果 mapView.fitExtent 定位。右侧面板或嵌入式 Panel。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `mapView.fitExtent` | 搜索结果定位 | MAP_SEARCH_PLUGIN_TOOL_ID |

## 互斥与协作

- 工具类：Coordinator 互斥


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
