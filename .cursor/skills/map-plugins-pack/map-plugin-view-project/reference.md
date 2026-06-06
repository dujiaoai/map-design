# view-project-plugin — 契约参考

## 概述

看项目：工具栏 + 右侧 Modify 壳（项目列表渐进接入）

| 属性 | 值 |
|------|-----|
| 类型 | modify-panel |
| toolId | `view-project-plugin` |
| 常量名 | `VIEW_PROJECT_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

show → Modify 互斥 → 挂载 ViewProjectModify 壳。侧栏折叠态读 mapBarSplit（leftCollapsed/rightCollapsed），勿恢复 uiStateRef 透传。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `mapBarSplit` | 三栏折叠态 | deps.mapBarSplit |
| `modifyPanels.closeSiblingExcept` | Modify 互斥 | MODIFY_PANELS_MUTEX_TRIPLET |

## 互斥与协作

- Modify 互斥组：打开前 closeSiblingExcept


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
