---
name: map-plugin-legend
description: >-
  React 地图「右下角图例面板，与专题图层勾选联动」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：右下角图例面板，与专题图层勾选联动

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display`

---

## 1. 产品契约

### 定位

右下角图例面板，与专题图层勾选联动

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- 右下角图例按钮；无数据自动隐藏
- 监听 getCheckedTopicIdsRef 与专题图层同步
- POST /legend/getLegendByTopicIds
- LegendPanel el-tree + base64 图片叶子节点
- 监听 `getCheckedTopicIdsRef(mapId)` 的变化，请求 `POST /legend/getLegendByTopicIds` 图例数据
- 提供 `LegendEntry.vue` 切换按钮（有数据时显示，无数据时自动隐藏）
- 提供 `LegendPanel.vue` 图例面板（el-tree，叶子节点渲染 base64 图片）

### 集成注意

- 通过 shared/hooks/useCheckedTopicIds 与专题图层协作，禁止跨插件 import

### 行为详述

无数据时 Entry 自动隐藏。监听 `getCheckedTopicIdsRef(mapId)` → POST /legend/getLegendByTopicIds → el-tree 展示（叶子 base64 图）。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useLegend(caps)` | `useLegend()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/legend/
├── hooks/useLegend.ts
├── components/LegendEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] useLegend：show/toggle/setVisible/destroy
- [ ] Entry 挂载到宿主工具栏或控件区
- [ ] 图层 create/destroy 与 mapId 生命周期绑定
- [ ] 无 Modify 则仅 Entry + core

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `getCheckedTopicIdsRef(mapId)` | 与专题图层勾选联动 | shared/hooks/useCheckedTopicIds |

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
