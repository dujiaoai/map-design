# ortho-imagery-plugin — 契约参考

## 概述

高清正射影像：期数下拉、TyLayer 瓦片、显隐与 switchPeriod

| 属性 | 值 |
|------|-----|
| 类型 | hybrid |
| toolId | `ortho-imagery-plugin` |
| 常量名 | `ORTHO_IMAGERY_PLUGIN_TOOL_ID` |
| Coordinator | 无 |
| lazyEntry | 无/轻量 Entry |
| 双宿主 | 否 |

## 集成模式

1. 宿主挂载 Entry
2. 首次交互 new Core(caps)
3. 卸载 destroy 图层

## 产品规格摘要

| 时序 | 行为 |
|------|------|
| 首次展开下拉 | getBaseMapData → new OrthoImagery(visible:false) |
| 选择期数 | setVisible(true) → switchPeriod(mapServers) |
| 再次点击同期 | 取消选中 → setVisible(false) |

**不 register Coordinator**（可与其它工具并行）。Entry 内 new Core，非 lazyEntry 主路径。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `mapView + 瓦片/图层 API` | 期数切换、显隐 | Entry 内 new Core(deps) |
| `baseMap.registerModuleApi` | 与底图切换模块联动（可选） | setVisible 注册 |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
