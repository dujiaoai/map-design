# high-speed-warning-plugin — 契约参考

## 概述

高速预警图层与面板（OL/Cesium 双宿主）

| 属性 | 值 |
|------|-----|
| 类型 | parallel-panel |
| toolId | `high-speed-warning-plugin` |
| 常量名 | `HIGH_SPEED_WARNING_PLUGIN_TOOL_ID` |
| Coordinator | 无 |
| lazyEntry | 有 |
| 双宿主 | 可能 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

权限 canShowHighSpeedWarning；预警计数 badge；面板开关同步预警图层显隐。并行面板，不 register 绘制互斥。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `modifyPanels.getVisibleRef` | 右栏显隐 | visibleRef(mapId) |
| `mapView + 图层 API` | 面板开关同步地图叠加 | 宿主 mapApi / Cesium 注入 |

## 互斥与协作

- 并行面板：不与 Coordinator 互斥


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
