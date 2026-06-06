---
name: map-plugin-brush
description: >-
  React 地图「画笔：按住拖拽绘制自由路径」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：画笔：按住拖拽绘制自由路径

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `brush-plugin`（`BRUSH_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

画笔：按住拖拽绘制自由路径

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- Brush.ts: 自由手绘画笔插件：按住拖拽绘制路径（LineString） 参考：https://xinzhi.space/map/
- style.ts: 画笔绘制样式：自由手绘路径（LineString）

### 集成注意

- Modify 不要增加「数据」Tab（画笔无折点表）

### 产品规格摘要

### 1. 插件概述

| 项           | 填写                                                  |
| ------------ | ----------------------------------------------------- |
| **插件名**   | `brush-plugin`                                        |
| **用途**     | 自由手绘画笔：按住拖拽绘制路径（LineString），支持连续绘制 |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core    |
| **参考**     | [新知卫星地图](https://xinzhi.space/map/)              |

---

### 2. 必选能力

- [x] 按住鼠标左键拖拽绘制路径（自由手绘）
- [x] 绘制过程显示实时预览（虚线路径）
- [x] 连续绘制：完成一笔后可继续下一笔
- [x] 点击已完成路径显示操作面板
- [x] 支持整体平移（路径平移）
- [x] 面板无移动功能（固定于起点）
- [x] 通过 Coordinator 实现与其他插件的互斥
- [x] 懒加载入口（createBrushPluginLazyEntry）供宿主按需加载

---

### 3. 技术约束

### 文件与职责

| 路径                                  | 职责                                                         |
| ------------------------------------- | ------------------------------------------------------------ |
| `core/Brush.ts`                       | 主类，pointer 拖拽采样、LineString 生成、编辑                 |
| `core/style.ts`                       | 画笔路径样式（线段、预览虚线）                                |
| `descriptor/descriptor.ts`            | createBrushPluginDescriptor(deps)                             |
| `lazyEntry/lazyEntry.ts`              | createBrushPluginLazyEntry()                                 |
| `hooks/useBrush.ts`                   | useBrush(deps)，桥接 UI 与 descriptor                        |
| `widgets/BrushEntry.vue`              | 入口 UI（ActionBarItem、ActionExit）                         |
| `widgets/BrushPanel.vue`              | 操作面板（路径平移）                                   …

### 4. 功能交互

- 按住左键拖拽：绘制路径，松开完成当前笔
- 连续绘制：完成一笔后可立即开始下一笔
- 点击已有路径：显示操作面板（长度、删除、平移）
- 路径可整体平移

---

### 5. 执行约束（How）

Definition of Done、When Blocked、边界等**操作约束**详见 [AGENTS.md](./AGENTS.md) 对应章节。

### 行为详述

pointerdown→move 采样 → pointerup 完成 LineString；连续多笔；Panel 固定起点无移动；Modify **无数据 Tab**（仅属性/样式/设置/工具）。

### React 架构建议

src/features/brush/ — pointer 拖拽采样 LineString；Modify 四 Tab（无数据）

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useBrush(caps)` | `useBrush()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/brush/
├── core/
├── hooks/useBrush.ts
├── components/
│   ├── BrushEntry.tsx
│   ├── BrushPanel.tsx
│   └── BrushModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`brush-plugin`（常量建议名 `BRUSH_PLUGIN_TOOL_ID`）
- [ ] useBrush：ensureLoaded → register；start/stop 走 coordinator
- [ ] Entry：工具栏项 + 退出
- [ ] Core：纯 TS，地图交互 + catalogPlotLayer（标绘类）
- [ ] Panel + Modify（属性/数据/样式/设置/工具 Tab）
- [ ] 单测 core 纯逻辑

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `coordinator` | 画笔互斥 | BRUSH_PLUGIN_TOOL_ID |
| `pointer 拖拽绘制` | LineString 采样 | core/Brush.ts |

---

## 4. 插件协作

- **toolId**：`brush-plugin` · 常量 `BRUSH_PLUGIN_TOOL_ID`


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
