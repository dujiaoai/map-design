# favorites-plugin — 契约参考

## 概述

收藏夹：目录树、标绘预览、点击地图要素打开对应工具编辑

| 属性 | 值 |
|------|-----|
| 类型 | modify-panel |
| toolId | `favorites-plugin` |
| 常量名 | `FAVORITES_PLUGIN_TOOL_ID` |
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
| 打开收藏夹 | Modify 互斥组关闭兄弟面板；挂载 FavoritesModify |
| 绘制 Tab 勾选标绘 | 拉取详情 → catalogPlotLayer 预览几何 → view.fit |
| 点击地图上预览要素 | loadPlotOpenEditByToolId → 目标工具 descriptor.openEditFromPreview |
| 切换测量工具 | coordinator 变更但**不**自动关闭收藏夹（空 deactivate） |

**标绘类插件契约**：descriptor 必须暴露 `openEditFromPreview`，否则地图点击有线/面但不弹编辑框。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `catalogPlotLayer + 预览` | 绘制 Tab 勾选预览 | useFavoriteDrawPlotPreview |
| `pluginsManage.getPlugins` | openEditFromPreview 桥接 | favoriteCatalogPlotMapClick |
| `setCatalogPlotSemanticHitFallback` | 目录层点击语义 | CatalogPlotSemanticBridge |

## 互斥与协作

- Modify 互斥组：打开前 closeSiblingExcept


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
