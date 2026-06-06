# spatial-analysis-cesium-plugin — 契约参考

## 概述

Cesium 空间分析（可视域/通视）

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

可视域与通视分析二选一激活；绘制分析几何 → 计算结果 overlay。组内 coordinator 互斥。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `Cesium viewer` | 三维场景/分析/量测 | IMapCesiumDeps |
| `coordinator（组内）` | 同组分析工具互斥 | deps.coordinator |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
