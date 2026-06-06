---
name: map-plugin-restore-map-view-extent
description: >-
  React 地图「恢复地图初始视图范围」能力（类型 map-chrome）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：恢复地图初始视图范围

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`map-chrome`

---

## 1. 产品契约

### 定位

恢复地图初始视图范围

### 边界规则

| 地图控件 | 挂载在地图容器角落，无 Modify |
| 无互斥 | 不参与 Coordinator |
| 轻量 | 调用宿主 baseMap / mapView API |

### 功能要点

- 恢复地图初始范围/视角
- 控件按钮一键 reset view
- 地图视图恢复交互（将当前视图 `fit` 到宿主约定的初始 `extent`）；
- 右下角控件区内的布局与命中区约定（与同组缩放、底图切换等纵向排列一致）；
- 与 `--map-widget-*` 主题变量对齐的最小样式结构（及与 `style.mdc` 一致的 Tailwind 优先策略）。
- **单击**入口触发恢复；当前实现通过 `deps.mapApi.restoreInitialViewExtent({ padding, duration })` 执行，参数默认值与 README 一致（`padding: [20,20,20,20]`、`duration: 300`）。
- **初始 `extent`** 由 `map-core` 在二阶段初始化中写入（`applyUserViewFromUserBaseInfo`）；本插件只消费，不发起业务 API。
- 无地图上下文、`mapApi` 不可用或 `extent` 无效时：**不**执行 `fit`，开发环境下输出可定位 `console.warn`，**不**抛出未捕获异常。
- 无障碍：入口使用原生 `<button>` 或等价可聚焦控件，并提供 `aria-label`（如「恢复地图范围」）。
- **禁止**在本插件内发起业务 API 请求。
- **禁止**将实现或文档绑定到特定业务页面路径（如某个 `apps/*` 页面专用写法）。
- **禁止**跨插件源码路径 `import` / `import type` / 静态路径的 `import(...)`。
- **禁止**在未走「新增插件流程」的情况下向 `map-core` 添加或修改与本部件相关的 `toolIds`（轻量形态不需要 toolId）。
- 产物必须位于 `packages-map` 范围内。

### 行为详述

点击按钮 → mapView 恢复宿主记录的 initialExtent/center+zoom。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useRestoreMapViewExtent(caps)` | `useRestoreMapViewExtent()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/restore-map-view-extent/
├── hooks/useRestoreMapViewExtent.ts
├── components/RestoreMapViewExtentEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] Entry 挂载到地图控件区
- [ ] 调用宿主 mapView / baseMap API，避免重复实现底图逻辑
- [ ] 无 Coordinator / 无 Modify

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `baseMap.setVecVisible / registerModuleApi` | 底图与子模块联动 | BaseOlMap / baseMapSwitcherRegisterViewModuleApi |
| `mapView` | 缩放、指北、恢复范围 | deps.mapApi |

---

## 4. 插件协作

- **toolId**：无（展示/控件类可能不参与 Coordinator）



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
