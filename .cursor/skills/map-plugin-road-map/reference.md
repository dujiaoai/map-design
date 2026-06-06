# road-map-plugin — 契约参考

## 概述

地名路网 WMTS 注记图层

| 属性 | 值 |
|------|-----|
| 类型 | display |
| toolId | — |
| 常量名 | — |
| Coordinator | 无 |
| lazyEntry | 无/轻量 Entry |
| 双宿主 | 否 |

## 集成模式

1. 宿主挂载 Entry
2. 首次交互 new Core(caps)
3. 卸载 destroy 图层

## 产品规格摘要

由 base-map-switcher 路网复选调用 registerModuleApi setVisible；独立 Entry 亦可显隐路网图层。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `mapView.fitExtent` | 定位/缩放至数据范围 | deps.mapApi |
| `permissions.can` | 功能卡片门控（可选） | Ruoyi 权限码 |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
