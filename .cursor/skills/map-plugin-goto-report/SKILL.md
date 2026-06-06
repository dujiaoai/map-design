---
name: map-plugin-goto-report
description: >-
  React 地图「跳转报表/附件上传与详情」能力（类型 modify-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：跳转报表/附件上传与详情

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`modify-panel` · **toolId** `goto-report-plugin`（`GOTO_REPORT_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

跳转报表/附件上传与详情

### 边界规则

| 右侧面板 | Modify 抽屉 420px |
| 互斥组 | 与做分析/属性/收藏/导入/报告同属 Modify 组 |
| 无绘制 | 通常无地图绘制交互 |

### 功能要点

- 右侧 Modify；宿主注入 uploadReportFile / itemDetail / attachmentPreview
- MODIFY_PANELS_MUTEX_TRIPLET 互斥
- lazyEntry 可携带异步组件 loader
- GoToReport.ts: 跳转到报告插件核心（BasePlugins） 仅负责工具显隐、Coordinator 与 modifyUI（右侧抽屉壳）；不向地图挂载业务图层。

### 行为详述

宿主注入 `uploadReportFile`、`itemDetail`、`attachmentPreview`。Modify 420px 展示报表列表/上传/预览；Modify 互斥组。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useGoToReport(caps)` | `useGotoReport()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/goto-report/
├── hooks/useGotoReport.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] useGotoReport：打开前 modifyPanels.closeSiblingExcept
- [ ] Modify 右栏 420px；visibleRef 按 mapId
- [ ] 无绘制态；仅面板交互

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `uploadReportFile / itemDetail` | 报表上传与详情 | 宿主 inject |

---

## 4. 插件协作

- **toolId**：`goto-report-plugin` · 常量 `GOTO_REPORT_PLUGIN_TOOL_ID`
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
