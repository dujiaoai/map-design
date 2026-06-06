# do-analysis-plugin — 契约参考

## 概述

做分析：工具栏入口 + 右侧分析抽屉壳（不含 identify/出图业务本体）

| 属性 | 值 |
|------|-----|
| 类型 | modify-panel |
| toolId | `do-analysis-plugin` |
| 常量名 | `DO_ANALYSIS_PLUGIN_TOOL_ID` |
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
| 点击工具栏「做分析」 | closeSiblingModifyExcept(do-analysis)；visible=true；lazyEntry ensureLoaded |
| 再次点击 / 关闭抽屉 | visible=false；unregister coordinator |
| 专题图层已打开 | **不强制**关闭专题图层（与属性查看等不同） |
| 切换测量/绘制工具 | coordinator 顶掉 register；抽屉可保持展开便于对照 |

**React 宿主需知**：Modify 内容为占位壳或嵌入 `DoAnalysis` 业务组件；API 与 Ruoyi 后端由宿主注入。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `modifyPanels.closeSiblingExcept` | 打开前关兄弟 Modify（专题图层除外） | MODIFY_PANELS_MUTEX_WHEN_OPENING_DO_ANALYSIS |
| `DoAnalysis 业务挂载点` | Modify 内 identify/出图 | map-core widgets/do-analysis |

## 互斥与协作

- Modify 互斥组：打开前 closeSiblingExcept


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
