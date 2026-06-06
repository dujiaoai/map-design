# import-file-plugin — 契约参考

## 概述

导入矢量/文件到目录标绘层

| 属性 | 值 |
|------|-----|
| 类型 | modify-panel |
| toolId | `import-file-plugin` |
| 常量名 | `IMPORT_FILE_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

打开前 Modify 互斥。用户选择文件 → 解析几何 → 写入 catalogPlotLayer 统一源；样式走 catalog 解析器注册表。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `modifyPanels.closeSiblingExcept` | 打开前关闭同组面板 | closeSiblingModifyPanelsExcept |
| `modifyPanels.getVisibleRef` | 右栏 420px 显隐 | visibleRef(mapId) |

## 互斥与协作

- Modify 互斥组：打开前 closeSiblingExcept


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
