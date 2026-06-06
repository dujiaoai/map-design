---
name: map-plugin-region-navigator
description: >-
  React 地图「行政区划导航：Popover 区划面板与围栏图层」能力（类型 map-chrome）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：行政区划导航：Popover 区划面板与围栏图层

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`map-chrome`

---

## 1. 产品契约

### 定位

行政区划导航：Popover 区划面板与围栏图层

### 边界规则

| 地图控件 | 挂载在地图容器角落，无 Modify |
| 无互斥 | 不参与 Coordinator |
| 轻量 | 调用宿主 baseMap / mapView API |

### 功能要点

- Popover + 区划面板；关闭不销毁保留状态
- regionFenceLayer 围栏 Group 单根挂载
- hooks/useRegionNavigator + libs 拉取区划
- 不含 ortho-imagery 影像业务
- 点击工具栏按钮展开 / 收起 Popover；`BasePluginsActionBarItem` 的 **`drawing` 仅与面板是否显示（Popover `visible`）同步**，不与区划选中态挂钩。
- 面板内容 `RegionNavigatorPanel`：**首次打开**异步按需加载 chunk；**再次打开**复用同一组件实例（不 `v-if` 卸载）。
- 首次展开或显隐变化时的数据初始化见 `RegionNavigatorPanel` 对 `visible` 的 `watch`（如 `ensureInitialized` / `clearSearchState`）。
- **禁止**在本插件中复制 `ortho-imagery-plugin` 的 `OrthoImagery`、`TyLayer`、`getBaseMapData` 等影像业务；需要影像时让宿主使用 `ortho-imagery-plugin` 或单独模块。
- 修改后：在仓库根目录执行 `pnpm --filter @haoxuan/map-plugins check:types`。

### 行为详述

Popover 打开区划树 → 选择区划 → regionFenceLayer 围栏高亮 + fitExtent。关闭 Popover 保留内部状态。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useRegionNavigator(caps)` | `useRegionNavigator()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/region-navigator/
├── hooks/useRegionNavigator.ts
├── components/RegionNavigatorEntry.tsx
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
| `mapView.fitExtent` | 区划定位 | regionFenceLayer |

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
