# panorama-roam-plugin — 契约参考

## 概述

全景漫游模块（底图切换卡片内）

| 属性 | 值 |
|------|-----|
| 类型 | display |
| toolId | `panorama-roam-plugin` |
| 常量名 | `PANORAMA_ROAM_PLUGIN_TOOL_ID` |
| Coordinator | 无 |
| lazyEntry | 无/轻量 Entry |
| 双宿主 | 否 |

## 集成模式

1. 宿主挂载 Entry
2. 首次交互 new Core(caps)
3. 卸载 destroy 图层

## 产品规格摘要

底图切换面板「全景漫游」卡片激活本模块；PanoramaRoamController 控制漫游态与地图联动。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `mapView.fitExtent` | 定位/缩放至数据范围 | deps.mapApi |
| `permissions.can` | 功能卡片门控（可选） | Ruoyi 权限码 |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
