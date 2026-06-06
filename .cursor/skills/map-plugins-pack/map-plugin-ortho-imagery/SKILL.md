---
name: map-plugin-ortho-imagery
description: >-
  React 地图「高清正射影像：期数下拉、TyLayer 瓦片、显隐与 switchPeriod」能力（类型 hybrid）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：高清正射影像：期数下拉、TyLayer 瓦片、显隐与 switchPeriod

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`hybrid` · **toolId** `ortho-imagery-plugin`（`ORTHO_IMAGERY_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

高清正射影像：期数下拉、TyLayer 瓦片、显隐与 switchPeriod

### 边界规则

| 混合形态 | Entry 内 new Core；未必 lazyEntry |
| 入口集成 | 下拉/开关 + 首次交互实例化 |
| 不互斥 | 通常不 register Coordinator |

### 功能要点

- OrthoImagery.ts: 高清影像（正射影像）图层 对齐 OrthoMap.js 功能：支持 URL 列表加载、mapServers 配置加载、期数切换、显示/隐藏
- 工具 ID：若将来接入 Coordinator，须从 `@haoxuan/map-core` 的 `constants/toolIds.ts` 使用 `ORTHO_IMAGERY_PLUGIN_TOOL_ID`，禁止硬编码字符串。
- 类型：优先使用 map-core 导出的 `OrthoImageryDataType`、`OrthoImageryListItemType`，避免与其它插件 `export *` 同名冲突。
- 修改后：在仓库根目录执行 `pnpm --filter @haoxuan/map-plugins check:types`。
- 用户首次**展开**下拉：`getBaseMapData()` → 构造 `OrthoImagery`，`visible: false`，尚未把瓦片加到图上或已加但不可见（见 `OrthoImagery`）。
- 用户**选择**某一期：`setVisible(true)` 再 `switchPeriod(item.mapServers)`（`switchPeriod` 内会按内部 `visible` 调用 `applyVisibility()`）。
- 再次点击**同一期**：取消选中，`setVisible(false)`。

### 行为详述

| 时序 | 行为 |
|------|------|
| 首次展开下拉 | getBaseMapData → new OrthoImagery(visible:false) |
| 选择期数 | setVisible(true) → switchPeriod(mapServers) |
| 再次点击同期 | 取消选中 → setVisible(false) |

**不 register Coordinator**（可与其它工具并行）。Entry 内 new Core，非 lazyEntry 主路径。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useOrthoMap(caps)` | `useOrthoImagery()` + MapHostProvider |
| Entry 内 `new Core({ caps })` | 首次交互实例化 |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/ortho-imagery/
├── hooks/useOrthoImagery.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] Entry 内实例化 core（首次交互 new Core）
- [ ] 图层/瓦片 destroy 与 mapId 生命周期绑定
- [ ] 按 §1 产品契约运行时序实现

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `mapView + 瓦片/图层 API` | 期数切换、显隐 | Entry 内 new Core(deps) |
| `baseMap.registerModuleApi` | 与底图切换模块联动（可选） | setVisible 注册 |

---

## 4. 插件协作

- **toolId**：`ortho-imagery-plugin` · 常量 `ORTHO_IMAGERY_PLUGIN_TOOL_ID`



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
