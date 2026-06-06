# scale-bar-plugin — 契约参考

## 概述

数字比例尺（1:N）控件

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

挂载 ScaleLine（隐藏 target）→ postrender 更新 1:N 文案 → 卸载 removeControl + unlisten。**禁止**业务 API 请求。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `mapView.getMap` | ScaleLine + postrender | useScaleBar + ol ScaleLine |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
