# scene-cesium-plugin — 契约参考

## 概述

Cesium 场景特效开关（雨/雪/雾等）

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

Entry 网格 switch 切换雨/雪/雾等；useSceneSpecialEffects 绑定 Cesium viewer 后处理。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `Cesium viewer` | 三维场景/分析/量测 | IMapCesiumDeps |
| `coordinator（组内）` | 同组分析工具互斥 | deps.coordinator |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
