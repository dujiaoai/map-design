# zoom-control-plugin — 契约参考

## 概述

二维缩放 +/- 控件

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

点击 +/- 调用 mapView zoomIn/zoomOut；无 Coordinator。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `baseMap.setVecVisible / registerModuleApi` | 底图与子模块联动 | BaseOlMap / baseMapSwitcherRegisterViewModuleApi |
| `mapView` | 缩放、指北、恢复范围 | deps.mapApi |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
