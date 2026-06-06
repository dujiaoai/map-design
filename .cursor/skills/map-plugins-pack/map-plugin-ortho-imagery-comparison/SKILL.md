---
name: map-plugin-ortho-imagery-comparison
description: >-
  React 地图「正射影像两期对比：工具互斥 + 双期卷帘/对比 UI」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：正射影像两期对比：工具互斥 + 双期卷帘/对比 UI

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `ortho-imagery-comparison-plugin`（`ORTHO_IMAGERY_COMPARISON_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

正射影像两期对比：工具互斥 + 双期卷帘/对比 UI

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- Coordinator 互斥工具
- 两期 ortho 瓦片对比交互
- 专用 Entry + Modify/Panel
- OrthoImageryComparison.ts: 高清影像对比插件核心（BasePlugins） 仅负责工具显隐、Coordinator 与 modifyUI（右侧抽屉壳）；不向地图挂载业务图层。
- Coordinator：`descriptor` 中空 `deactivate`，切换其它工具不自动关本抽屉。
- Modify 互斥：与卷帘对比等共用 `MODIFY_PANELS_MUTEX_WHEN_OPENING_COMPARISON`；已登记于 `modify-panels-mutex/triplet.ts`；打开专题图层时不强制收起本抽屉（与 `COMPARISON_PLUGIN` 同列排除）。
- **插件间禁止互相 import**（业务协作通过 `pluginsManage.getPlugins` + 宿主注册）。

### 集成注意

- Modify 互斥：见 hooks 内 MODIFY_PANELS_MUTEX 常量

### 行为详述

与 comparison-plugin（地图卷帘）不同：本插件聚焦**正射影像期数 A vs B** 的对比展示。激活时 register；退出时 destroy 双期图层。

### React 架构建议

src/features/ortho-imagery-comparison/ — 双期 TyLayer + Coordinator 互斥 Entry

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useOrthoImageryComparison(caps)` | `useOrthoImageryComparison()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/ortho-imagery-comparison/
├── core/
├── hooks/useOrthoImageryComparison.ts
├── components/
│   ├── OrthoImageryComparisonEntry.tsx
│   ├── OrthoImageryComparisonPanel.tsx
│   └── OrthoImageryComparisonModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`ortho-imagery-comparison-plugin`（常量建议名 `ORTHO_IMAGERY_COMPARISON_PLUGIN_TOOL_ID`）
- [ ] useOrthoImageryComparison：ensureLoaded → register；start/stop 走 coordinator
- [ ] Entry：工具栏项 + 退出
- [ ] Core：纯 TS，地图交互 + catalogPlotLayer（标绘类）
- [ ] Panel + Modify（属性/数据/样式/设置/工具 Tab）
- [ ] 单测 core 纯逻辑

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `coordinator.register/unregister` | 工具激活/切换互斥 | deps.coordinator |
| `pluginsManage.ensureLoaded` | 懒加载 descriptor | deps.pluginsManage |
| `catalogPlotLayer` | 标绘类写入统一矢量源 | BaseOlMap.getOrCreateCatalogPlotLayer() |
| `modifyPanels.getVisibleRef` | Modify 抽屉显隐 | visibleRef(mapId) |

---

## 4. 插件协作

- **toolId**：`ortho-imagery-comparison-plugin` · 常量 `ORTHO_IMAGERY_COMPARISON_PLUGIN_TOOL_ID`


- **Coordinator**：与其它绘制/测量工具互斥
- 跨插件协作：`pluginsManage.getPlugins(toolId)`，禁止跨 feature 目录 import

---

## 不要做的事

- 不要跨插件 feature 目录互相 import
- 不要硬编码 toolId 字符串
- 不要绕过 Coordinator（工具类）
- 不要用全局单例代替 per-mapId 状态


---

## 延伸阅读

- [reference.md](reference.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
