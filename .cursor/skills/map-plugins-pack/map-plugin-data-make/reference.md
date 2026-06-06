# data-make-plugin — 契约参考

## 概述

全景制作：工具栏 + 右侧 Modify 壳（业务渐进接入）

| 属性 | 值 |
|------|-----|
| 类型 | modify-panel |
| toolId | `data-make-plugin` |
| 常量名 | `DATA_MAKE_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

与 favorites/view-project 同类 **壳插件**：show → Modify 互斥 → 挂载空 Modify 供业务 Tab 接入。切换绘制工具不自动关面板。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `modifyPanels.closeSiblingExcept` | Modify 互斥 | MODIFY_PANELS_MUTEX_TRIPLET |

## 互斥与协作

- Modify 互斥组：打开前 closeSiblingExcept


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
