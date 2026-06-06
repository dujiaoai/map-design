# spatial-measure-cesium-plugin — 契约参考

## 概述

Cesium 三维空间量测

| 属性 | 值 |
|------|-----|
| 类型 | cesium-toolkit |
| toolId | — |
| 常量名 | — |
| Coordinator | 无 |
| lazyEntry | 无/轻量 Entry |
| 双宿主 | 可能 |

## 集成模式

1. 宿主挂载 Entry
2. 首次交互 new Core(caps)
3. 卸载 destroy 图层

## 产品规格摘要

距离/面积/高度量测；激活一种量测工具 → 绘制 → 显示结果 → stop 清理。仅 Cesium。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `Cesium viewer` | 三维场景/分析/量测 | IMapCesiumDeps |
| `coordinator（组内）` | 同组分析工具互斥 | deps.coordinator |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
