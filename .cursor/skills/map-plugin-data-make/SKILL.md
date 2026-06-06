---
name: map-plugin-data-make
description: >-
  React 地图「全景制作：工具栏 + 右侧 Modify 壳」能力（类型 modify-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：全景制作：工具栏 + 右侧 Modify 壳（业务渐进接入）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`modify-panel` · **toolId** `data-make-plugin`（`DATA_MAKE_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

全景制作：工具栏 + 右侧 Modify 壳（业务渐进接入）

### 边界规则

| 右侧面板 | Modify 抽屉 420px |
| 互斥组 | 与做分析/属性/收藏/导入/报告同属 Modify 组 |
| 无绘制 | 通常无地图绘制交互 |

### 功能要点

- Entry「全景制作」+ Modify 420px 壳
- DATA_MAKE_PLUGIN_TOOL_ID；空 deactivate
- Modify 互斥组（含看项目/事件/专题等）
- lazyEntry ensureLoaded
- DataMake.ts: 全景制作插件核心（BasePlugins） 仅负责工具显隐、Coordinator 与 modifyUI（右侧抽屉壳）；不向地图挂载业务图层。
- 插件间禁止互相 import：跨插件能力仅通过 `IDeps.pluginsManage.getPlugins(toolId)` 与宿主注册衔接。
- Coordinator：以 `descriptor.ts` 为准（**空 `deactivate`**，切换其它工具不自动关面板）。
- modifyUI：`load()` 成功后挂载 Modify 壳组件。
- Modify 抽屉互斥：与做分析 / 属性查看 / 收藏夹 / 看项目 / 事件 / 专题图层同属 `MODIFY_PANELS_MUTEX_TRIPLET`（见 `modify-panels-mutex/triplet.ts`）。

### 集成注意

- Modify 互斥：见 hooks 内 MODIFY_PANELS_MUTEX 常量

### 行为详述

与 favorites/view-project 同类 **壳插件**：show → Modify 互斥 → 挂载空 Modify 供业务 Tab 接入。切换绘制工具不自动关面板。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useDataMake(caps)` | `useDataMake()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/data-make/
├── hooks/useDataMake.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] toolId：`data-make-plugin`（DATA_MAKE_PLUGIN_TOOL_ID）
- [ ] Modify 互斥；空 deactivate
- [ ] Modify 内预留全景制作业务挂载点

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `modifyPanels.closeSiblingExcept` | Modify 互斥 | MODIFY_PANELS_MUTEX_TRIPLET |

---

## 4. 插件协作

- **toolId**：`data-make-plugin` · 常量 `DATA_MAKE_PLUGIN_TOOL_ID`
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
