# special-topic-layer-plugin — 契约参考

## 概述

专题图层：专题目录树、勾选加载、透明度与批量设置

| 属性 | 值 |
|------|-----|
| 类型 | parallel-panel |
| toolId | `special-topic-layer-plugin` |
| 常量名 | `SPECIAL_TOPIC_LAYER_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

| 用户动作 | 系统响应 |
|----------|----------|
| 打开专题图层 | visible=true；**不**关闭做分析面板 |
| 勾选叶子节点 | 加载/移除专题图层；更新 getCheckedTopicIdsRef |
| 调整透明度 | 单图层或批量 opacity drawer |
| 关闭面板 | 按 sync 逻辑清理地图图层（nodeId 精确匹配） |

**legend-plugin** 监听 getCheckedTopicIdsRef 联动图例。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `getCheckedTopicIdsRef` | 供 legend 等订阅 | shared/hooks/useCheckedTopicIds |
| `专题图层 load/remove` | nodeId 精确移除 | useSpecialTopicCatalog |

## 互斥与协作

- 并行面板：不与 Coordinator 互斥


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
