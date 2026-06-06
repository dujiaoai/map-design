# base-map-switcher-plugin — 契约参考

## 概述

右下角底图切换：正射/电子地图/全景漫游与区划路网复选

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

| 卡片/复选 | 行为 |
|----------|------|
| 正射影像 | 调 ortho-imagery / 正射模块 setVisible |
| 电子地图 | base-map-vec 互斥切换 vec/img WMTS |
| 全景漫游 | panorama-roam 模块 |
| 行政区划/路网 | region-map / road-map registerModuleApi |

面板右下角弹出；registerModuleApi 注册子模块显隐。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `baseMap.registerModuleApi` | 正射/电子地图/全景/区划/路网子模块 | useBaseMapSwitcher |
| `permissions.can` | 正射影像权限门控 | YUNKAN_MAP_ORTHOPHOTO_MAP_* |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
