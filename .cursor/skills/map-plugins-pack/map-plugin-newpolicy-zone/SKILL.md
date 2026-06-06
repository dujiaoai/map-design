---
name: map-plugin-newpolicy-zone
description: >-
  React 地图「新政区域图层展示」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：新政区域图层展示

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display`

---

## 1. 产品契约

### 定位

新政区域图层展示

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- 区域边界/政策区划图层
- 显隐切换
- FunctionCard 或 Entry 入口

### 行为详述

加载新政区域矢量/瓦片 → setVisible 切换；可与测量工具并行。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useNewpolicyZone(caps)` | `useNewpolicyZone()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/newpolicy-zone/
├── hooks/useNewpolicyZone.ts
├── components/NewpolicyZoneEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] useNewpolicyZone：show/toggle/setVisible/destroy
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
