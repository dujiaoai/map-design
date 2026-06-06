# legend-plugin — 契约参考

## 概述

右下角图例面板，与专题图层勾选联动

| 属性 | 值 |
|------|-----|
| 类型 | display |
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

无数据时 Entry 自动隐藏。监听 `getCheckedTopicIdsRef(mapId)` → POST /legend/getLegendByTopicIds → el-tree 展示（叶子 base64 图）。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `getCheckedTopicIdsRef(mapId)` | 与专题图层勾选联动 | shared/hooks/useCheckedTopicIds |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
