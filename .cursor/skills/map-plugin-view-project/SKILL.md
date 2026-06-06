---
name: map-plugin-view-project
description: >-
  React 地图「看项目：工具栏 + 右侧 Modify 壳」能力（类型 modify-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：看项目：工具栏 + 右侧 Modify 壳（项目列表渐进接入）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`modify-panel` · **toolId** `view-project-plugin`（`VIEW_PROJECT_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

看项目：工具栏 + 右侧 Modify 壳（项目列表渐进接入）

### 边界规则

| 右侧面板 | Modify 抽屉 420px |
| 互斥组 | 与做分析/属性/收藏/导入/报告同属 Modify 组 |
| 无绘制 | 通常无地图绘制交互 |

### 功能要点

- Entry「看项目」+ Modify 壳
- VIEW_PROJECT_PLUGIN_TOOL_ID；空 deactivate
- Modify 互斥；可读 deps.mapBarSplit 三栏布局
- lazyEntry ensureLoaded
- ViewProject.ts: 看项目插件核心（BasePlugins） 仅负责工具显隐、Coordinator 与 modifyUI（右侧抽屉壳）；不向地图挂载业务图层。
- 插件间禁止互相 import：跨插件能力仅通过 `IDeps.pluginsManage.getPlugins(toolId)` 与宿主注册衔接。
- Coordinator：以 `descriptor.ts` 为准（**空 `deactivate`**，切换其它工具不自动关面板）。
- modifyUI：`load()` 成功后挂载 Modify 壳组件。
- Modify 抽屉互斥：与做分析 / 属性查看 / 收藏夹 / 专题图层同属 `MODIFY_PANELS_MUTEX_TRIPLET`（见 `modify-panels-mutex/triplet.ts`）。

### 集成注意

- Modify 互斥：见 hooks 内 MODIFY_PANELS_MUTEX 常量

### 行为详述

show → Modify 互斥 → 挂载 ViewProjectModify 壳。侧栏折叠态读 mapBarSplit（leftCollapsed/rightCollapsed），勿恢复 uiStateRef 透传。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `usePanoramaSceneMarkersLayer(caps)` | `useViewProject()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/view-project/
├── hooks/useViewProject.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] toolId：`view-project-plugin`
- [ ] Modify 420px；mapBarSplit 布局联动
- [ ] 空 deactivate；Modify 互斥组

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `mapBarSplit` | 三栏折叠态 | deps.mapBarSplit |
| `modifyPanels.closeSiblingExcept` | Modify 互斥 | MODIFY_PANELS_MUTEX_TRIPLET |

---

## 4. 插件协作

- **toolId**：`view-project-plugin` · 常量 `VIEW_PROJECT_PLUGIN_TOOL_ID`
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
