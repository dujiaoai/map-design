---
name: map-plugin-do-analysis
description: >-
  React 地图「做分析：工具栏入口 + 右侧分析抽屉壳」能力（类型 modify-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：做分析：工具栏入口 + 右侧分析抽屉壳（不含 identify/出图业务本体）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`modify-panel` · **toolId** `do-analysis-plugin`（`DO_ANALYSIS_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

做分析：工具栏入口 + 右侧分析抽屉壳（不含 identify/出图业务本体）

### 边界规则

| 右侧面板 | Modify 抽屉 420px，仅壳层 |
| Modify 互斥 | 与属性/收藏/导入/报告互斥 |
| 专题图层 | **可与专题图层面板同时展开**（例外规则） |
| 业务边界 | identify/点选/出图在 map-core widgets 或 Modify 内渐进接入 |

### 功能要点

- 工具栏 Entry + 右侧 BasePluginsModifyRightBar 420px
- 壳层：业务可在 Modify 内接入或挂载 map-core DoAnalysis 组件
- 打开时 MODIFY 互斥；可与专题图层并行展开
- toolId：DO_ANALYSIS_PLUGIN_TOOL_ID
- DoAnalysisPanel.ts: 做分析插件核心（BasePlugins） 仅负责工具显隐、Coordinator 与 modifyUI（右侧抽屉壳）；业务内容由宿主或后续迭代接入。
- 工具 ID：`DO_ANALYSIS_PLUGIN_TOOL_ID`（与 map-core 做分析 Widget 内 `activatePlugin` 使用同一常量，协调器语义需与产品一致）。
- 互斥：`hooks/useDoAnalysis.ts` 使用 `MODIFY_PANELS_MUTEX_WHEN_OPENING_DO_ANALYSIS`：**不与专题图层抽屉互斥**（可同时展开）；与其它右侧面板仍互斥。
- `BasePlugins`：`mountModifyUI`、显隐（core/DoAnalysisPanel.ts）
- `DO_ANALYSIS_PLUGIN_TOOL_ID`、`getDoAnalysisVisibleRef`（descriptor/descriptor.ts）
- `createDoAnalysisPluginLazyEntry`（lazyEntry/lazyEntry.ts）
- `show` / `toggle` / `setVisible`；`MODIFY_PANELS_MUTEX_TRIPLET`（hooks/useDoAnalysis.ts）
- 工具栏入口（features/DoAnalysisEntry.vue）
- 右侧抽屉壳（features/DoAnalysisModify.vue）

### 集成注意

- Modify 互斥：见 hooks 内 MODIFY_PANELS_MUTEX 常量
- 可与专题图层面板并行展开

### 行为详述

| 用户动作 | 系统响应 |
|----------|----------|
| 点击工具栏「做分析」 | closeSiblingModifyExcept(do-analysis)；visible=true；lazyEntry ensureLoaded |
| 再次点击 / 关闭抽屉 | visible=false；unregister coordinator |
| 专题图层已打开 | **不强制**关闭专题图层（与属性查看等不同） |
| 切换测量/绘制工具 | coordinator 顶掉 register；抽屉可保持展开便于对照 |

**React 宿主需知**：Modify 内容为占位壳或嵌入 `DoAnalysis` 业务组件；API 与 Ruoyi 后端由宿主注入。

### React 架构建议

```
src/features/do-analysis/
├── hooks/useDoAnalysis.ts       # show/toggle/setVisible + mutex
├── components/DoAnalysisEntry.tsx
├── components/DoAnalysisModify.tsx  # 420px 右栏
└── index.ts
```

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useDoAnalysis(caps)` | `useDoAnalysis()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/do-analysis/
├── hooks/useDoAnalysis.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] toolId：`do-analysis-plugin`（DO_ANALYSIS_PLUGIN_TOOL_ID）
- [ ] 打开前 modifyPanels.closeSiblingExcept（**排除** special-topic 互斥）
- [ ] Modify 420px；visibleRef 按 mapId
- [ ] lazyEntry ensureLoaded
- [ ] Modify 内预留 DoAnalysis 业务挂载点

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `modifyPanels.closeSiblingExcept` | 打开前关兄弟 Modify（专题图层除外） | MODIFY_PANELS_MUTEX_WHEN_OPENING_DO_ANALYSIS |
| `DoAnalysis 业务挂载点` | Modify 内 identify/出图 | map-core widgets/do-analysis |

---

## 4. 插件协作

- **toolId**：`do-analysis-plugin` · 常量 `DO_ANALYSIS_PLUGIN_TOOL_ID`
- **Modify 互斥组**：打开前 `modifyPanels.closeSiblingExcept`


- 跨插件协作：`pluginsManage.getPlugins(toolId)`，禁止跨 feature 目录 import

---

## 不要做的事

- 不要跨插件 feature 目录互相 import
- 不要硬编码 toolId 字符串

- 不要用全局单例代替 per-mapId 状态


---

## 延伸阅读

- [reference.md](reference.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
