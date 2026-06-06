# region-navigator-plugin — 契约参考

## 概述

行政区划导航：Popover 区划面板与围栏图层

| 属性 | 值 |
|------|-----|
| 类型 | map-chrome |
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

Popover 打开区划树 → 选择区划 → regionFenceLayer 围栏高亮 + fitExtent。关闭 Popover 保留内部状态。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `mapView.fitExtent` | 区划定位 | regionFenceLayer |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
