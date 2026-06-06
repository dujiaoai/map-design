# goto-report-plugin — 契约参考

## 概述

跳转报表/附件上传与详情

| 属性 | 值 |
|------|-----|
| 类型 | modify-panel |
| toolId | `goto-report-plugin` |
| 常量名 | `GOTO_REPORT_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

宿主注入 `uploadReportFile`、`itemDetail`、`attachmentPreview`。Modify 420px 展示报表列表/上传/预览；Modify 互斥组。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `uploadReportFile / itemDetail` | 报表上传与详情 | 宿主 inject |

## 互斥与协作

- Modify 互斥组：打开前 closeSiblingExcept


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
