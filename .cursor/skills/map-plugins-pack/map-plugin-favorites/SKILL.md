---
name: map-plugin-favorites
description: >-
  React 地图「收藏夹：目录树、标绘预览、点击地图要素打开对应工具编辑」能力（类型 modify-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：收藏夹：目录树、标绘预览、点击地图要素打开对应工具编辑

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`modify-panel` · **toolId** `favorites-plugin`（`FAVORITES_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

收藏夹：目录树、标绘预览、点击地图要素打开对应工具编辑

### 边界规则

| 右侧面板 | Modify 420px；多 Tab |
| Modify 互斥 | 与做分析/属性/导入/报告互斥 |
| Coordinator | register 使用**空 deactivate** |
| 跨插件 | 仅 pluginsManage.getPlugins(toolId)，禁止 import 其它插件 |

### 功能要点

- Tab：绘制 / 全景等；绘制 Tab 勾选 → 地图预览 + fitExtent
- 目录层点击线/面 → openEditFromPreview 转发各标绘工具
- Coordinator register 但 deactivate 为空（切换工具不自动关面板）
- CatalogPlotSemanticBridge 与 map 同寿命注册预览语义点击
- Favorites.ts: 收藏夹插件核心（BasePlugins） 仅负责工具显隐、Coordinator 与 modifyUI（右侧抽屉）；不向地图挂载业务图层。
- 矢量工具与收藏夹编辑：`hooks/favoriteCatalogPlotMapClick.ts` 的 `loadPlotOpenEditByToolId` 依赖各插件 **descriptor** 暴露 `openEditFromPreview`（由 Core 委托）。新增或改动目录标绘类插件时，须遵守包级 [map-plugins AGENTS.md](../../AGENTS.md) 中 **「收藏夹 / 目录层点击：descriptor 必须转发 openEditFromPreview」**；漏挂则点击地图有线/面要素但**不弹编辑框**。
- 插件间禁止互相 import：不得 `import` / `import type` 其它插件目录（如 `demo-plugin`）；跨插件能力仅通过 `IDeps.pluginsManage.getPlugins(toolId)` 与在本插件内自声明的最小接口（如 `FavoritesPlotPreviewEditBridge`）衔接；宿主需提前 `setPlugins` 注册目标工具（如 demo）。
- Coordinator：`register` 使用 **空 `deactivate`**（切换其它工具不自动关收藏夹面板）；以 `descriptor.ts` 为准。
- modifyUI：`load()` 成功后挂载 `FavoritesModify`。
- 工具 ID：使用 `FAVORITES_PLUGIN_TOOL_ID`（定义于 `@haoxuan/map-core` `constants/toolIds.ts`），**禁止**与 `do-analysis-plugin` 共用 `DO_ANALYSIS_PLUGIN_TOOL_ID`。
- 收藏项数据结构、列表加载、筛选、分页
- 与标绘/要素/服务端同步、权限与错误处理
- 与地图联动（全景 Tab、详情面板等，绘制预览已部分覆盖）

### 行为详述

| 用户动作 | 系统响应 |
|----------|----------|
| 打开收藏夹 | Modify 互斥组关闭兄弟面板；挂载 FavoritesModify |
| 绘制 Tab 勾选标绘 | 拉取详情 → catalogPlotLayer 预览几何 → view.fit |
| 点击地图上预览要素 | loadPlotOpenEditByToolId → 目标工具 descriptor.openEditFromPreview |
| 切换测量工具 | coordinator 变更但**不**自动关闭收藏夹（空 deactivate） |

**标绘类插件契约**：descriptor 必须暴露 `openEditFromPreview`，否则地图点击有线/面但不弹编辑框。

### React 架构建议

```
src/features/favorites/
├── hooks/useFavorites.ts
├── hooks/useFavoriteDrawPlotPreview.ts
├── lib/favoriteCatalogPlotMapClick.ts   # openEditFromPreview 桥接
├── components/FavoritesEntry.tsx
├── components/FavoritesModify.tsx
├── components/CatalogPlotSemanticBridge.tsx  # 与 Map 同寿命
└── index.ts
```

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useFavoriteDrawPlotPreview(caps)` | `useFavorites()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/favorites/
├── hooks/useFavorites.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] useFavorites：打开前 modifyPanels.closeSiblingExcept
- [ ] Modify 右栏 420px；visibleRef 按 mapId
- [ ] 无绘制态；仅面板交互

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `catalogPlotLayer + 预览` | 绘制 Tab 勾选预览 | useFavoriteDrawPlotPreview |
| `pluginsManage.getPlugins` | openEditFromPreview 桥接 | favoriteCatalogPlotMapClick |
| `setCatalogPlotSemanticHitFallback` | 目录层点击语义 | CatalogPlotSemanticBridge |

---

## 4. 插件协作

- **toolId**：`favorites-plugin` · 常量 `FAVORITES_PLUGIN_TOOL_ID`
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
