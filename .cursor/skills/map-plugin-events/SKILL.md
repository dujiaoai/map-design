---
name: map-plugin-events
description: >-
  React 地图「事件点位展示与列表面板」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：事件点位展示与列表面板

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display` · **toolId** `events-plugin`（`EVENTS_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

事件点位展示与列表面板

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- 事件点位展示图层
- 事件列表/筛选 widgets
- Events.ts: events-plugin 核心（BasePlugins） 仅负责工具显隐、Coordinator 与 modifyUI（右侧抽屉壳）；不向地图挂载业务图层。
- 插件间禁止互相 import：跨插件能力仅通过 `IDeps.pluginsManage.getPlugins(toolId)` 与宿主注册衔接。
- Coordinator：以 `descriptor.ts` 为准（**空 `deactivate`**，切换其它工具不自动关面板）。
- modifyUI：`load()` 成功后挂载 Modify 壳组件。
- Modify 抽屉互斥：**不参与** `MODIFY_PANELS_MUTEX_TRIPLET`，可与其它面板（含做分析、专题图层、飞行数据等）同时展开；Coordinator 注册空 `deactivate`，切换其它工具时不自动关闭本面板。

### 集成注意

- Modify 互斥：见 hooks 内 MODIFY_PANELS_MUTEX 常量

### 行为详述

EVENTS_PLUGIN_TOOL_ID；地图事件点位图层 + 右侧/Panel 列表筛选；可与工具并行（按实现 register 策略）。

### React 架构建议

src/features/events/ — 点位 VectorLayer + EventsModify/列表 widgets

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useEventAuthTagOptions(caps)` | `useEvents()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/events/
├── hooks/useEvents.ts
├── components/EventsEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] useEvents：show/toggle/setVisible/destroy
- [ ] Entry 挂载到宿主工具栏或控件区
- [ ] 图层 create/destroy 与 mapId 生命周期绑定
- [ ] Modify 抽屉按需

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `mapView + VectorLayer` | 事件点位 | EVENTS_PLUGIN_TOOL_ID |

---

## 4. 插件协作

- **toolId**：`events-plugin` · 常量 `EVENTS_PLUGIN_TOOL_ID`



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
