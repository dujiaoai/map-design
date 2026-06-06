# property-view-plugin — 契约参考

## 概述

属性查看：专题图选择 + 地图叠加专题图层（不含高清影像底图）

| 属性 | 值 |
|------|-----|
| 类型 | modify-panel |
| toolId | `property-view-plugin` |
| 常量名 | `PROPERTY_VIEW_PLUGIN_TOOL_ID` |
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
| 打开属性查看 | Modify 互斥；register coordinator；挂载 Modify |
| 选择专题图 | applySpecialTopicLayersToMap 更新地图图层 |
| 激活测量/绘制工具 | unregister coordinator；**抽屉仍可见** |
| 用户手动关闭 | unregister + visible=false + 清理专题图层（按产品） |

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `applySpecialTopicLayersToMap` | 专题图选择后上图 | map-core 专题 API |
| `coordinator（弱关抽屉）` | 被顶掉不收起 Modify | PropertyView.ts |

## 互斥与协作

- Modify 互斥组：打开前 closeSiblingExcept


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
