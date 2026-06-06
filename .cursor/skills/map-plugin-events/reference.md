# events-plugin — 契约参考

## 概述

事件点位展示与列表面板

| 属性 | 值 |
|------|-----|
| 类型 | display |
| toolId | `events-plugin` |
| 常量名 | `EVENTS_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

EVENTS_PLUGIN_TOOL_ID；地图事件点位图层 + 右侧/Panel 列表筛选；可与工具并行（按实现 register 策略）。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `mapView + VectorLayer` | 事件点位 | EVENTS_PLUGIN_TOOL_ID |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
