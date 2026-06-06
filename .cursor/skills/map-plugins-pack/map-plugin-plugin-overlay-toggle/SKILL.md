---
name: map-plugin-plugin-overlay-toggle
description: >-
  React 地图「目录标绘一键清除」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：目录标绘一键清除

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display` · **toolId** `plugin-overlay-toggle-plugin`（`PLUGIN_OVERLAY_TOGGLE_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

目录标绘一键清除

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- 清空 catalog-plot 统一矢量源全部要素
- 执行前 PLUGIN_OVERLAY_TOGGLE_BEFORE_HIDE_EVENT 关编辑面板
- 不删除收藏夹文件记录；不删底图/高清影像
- deactivateAll 退出当前绘制工具
- OverlayToggle.ts: 目录标绘一键清除 清空 `catalog-plot` 统一矢量源上的全部要素（各插件标绘、收藏夹勾选预览等），不删底图；

### 行为详述

触发清除：emit 关编辑面板事件 → 清空 catalogPlotLayer 全部要素 → deactivateAll 绘制工具。**不**删收藏夹记录与底图/正射图层。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useOverlayToggle(caps)` | `usePluginOverlayToggle()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/plugin-overlay-toggle/
├── hooks/usePluginOverlayToggle.ts
├── components/PluginOverlayToggleEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] usePluginOverlayToggle：show/toggle/setVisible/destroy
- [ ] Entry 挂载到宿主工具栏或控件区
- [ ] 图层 create/destroy 与 mapId 生命周期绑定
- [ ] 无 Modify 则仅 Entry + core

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `mapView.fitExtent` | 定位/缩放至数据范围 | deps.mapApi |
| `permissions.can` | 功能卡片门控（可选） | Ruoyi 权限码 |

---

## 4. 插件协作

- **toolId**：`plugin-overlay-toggle-plugin` · 常量 `PLUGIN_OVERLAY_TOGGLE_PLUGIN_TOOL_ID`



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
