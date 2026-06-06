# comparison-plugin — 契约参考

## 概述

卷帘/分屏地图对比（工具条 + 左侧参数抽屉）

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `comparison-plugin` |
| 常量名 | `COMPARISON_PLUGIN_TOOL_ID` |
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
| 点击 Swipe 工具 | register；打开左侧 ModifyLeftBar 配置卷帘 |
| Esc | 退出对比；unregister；清理卷帘图层 |
| 切换其它绘制工具 | coordinator deactivate 停对比 |

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `coordinator` | 卷帘工具互斥 | COMPARISON_PLUGIN_TOOL_ID |

## 互斥与协作

- 工具类：Coordinator 互斥


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
