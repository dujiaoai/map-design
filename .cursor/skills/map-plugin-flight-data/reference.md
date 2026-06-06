# flight-data-plugin — 契约参考

## 概述

飞行数据右侧面板（OL/Cesium 双宿主）

| 属性 | 值 |
|------|-----|
| 类型 | parallel-panel |
| toolId | `flight-data-plugin` |
| 常量名 | `FLIGHT_DATA_PLUGIN_TOOL_ID` |
| Coordinator | noop / 不互斥 |
| lazyEntry | 有 |
| 双宿主 | 可能 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

FunctionCard 打开右栏 420px；权限 canShowFlightData。双宿主 Shell：OL FlightDataPanel / Cesium FlightDataCesiumShell。关闭时清理飞行相关地图叠加。

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
