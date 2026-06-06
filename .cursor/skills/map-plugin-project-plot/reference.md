# project-plot-plugin — 契约参考

## 概述

工程标绘：工程范围正射瓦片加载、期数切换与显隐

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `project-plot-plugin` |
| 常量名 | `PROJECT_PLOT_PLUGIN_TOOL_ID` |
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
| 打开工程标绘 | register；加载 TyLayer；Modify 显示期数 |
| switchPeriod | replaceBaseMapLayersFromConfigs / 内部 switchPeriod |
| setVisible(false) | 隐藏 ortho 图层；unregister |

**宿主需知**：加密 XYZ 解密能力需由 map 引擎或宿主提供（云眼：EncryptedXYZSource）。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `EncryptedXYZ / TyLayer` | 加密正射瓦片 | libs/TyLayer + map-core |
| `coordinator` | 工具互斥 | register on show |

## 互斥与协作

- 工具类：Coordinator 互斥


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
