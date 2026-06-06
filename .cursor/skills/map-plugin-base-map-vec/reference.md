# base-map-vec-plugin — 契约参考

## 概述

电子地图与影像底图互斥切换

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

vec 与 img 天地图底图互斥；调用宿主 setBaseLayerVecActive(true/false)，不在插件内新建 WMTS。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `baseMap.setBaseLayerVecActive` | vec/img 互斥 | BaseOlMap.setBaseLayerVecActive |
| `baseMap.registerModuleApi` | 底图切换面板注册 | baseMapSwitcherRegisterViewModuleApi |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
