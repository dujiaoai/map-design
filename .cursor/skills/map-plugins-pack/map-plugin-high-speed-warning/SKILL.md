---
name: map-plugin-high-speed-warning
description: >-
  React 地图「高速预警图层与面板」能力（类型 parallel-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：高速预警图层与面板（OL/Cesium 双宿主）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`parallel-panel` · **toolId** `high-speed-warning-plugin`（`HIGH_SPEED_WARNING_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

高速预警图层与面板（OL/Cesium 双宿主）

### 边界规则

| 不互斥 | 不参与 Coordinator 或空 deactivate |
| 右侧面板 | Modify 抽屉 420px；可与其它工具并行 |
| 双宿主 | OL/Cesium 图层走宿主注入 |

### 功能要点

- 权限 canShowHighSpeedWarning
- 预警计数 widgets/warningCount
- 不与任何插件互斥
- HighSpeedWarning.ts: 高速预警插件核心（BasePlugins） 仅负责工具显隐与 modifyUI（左侧抽屉）；不向地图挂载业务图层。
- HighSpeedWarningCesiumShell.ts: Cesium 宿主下的高速预警左侧壳：不继承 BasePlugins，仅挂载 Modify 与宿主 appContext 对齐。

### 行为详述

权限 canShowHighSpeedWarning；预警计数 badge；面板开关同步预警图层显隐。并行面板，不 register 绘制互斥。

### React 架构建议

src/features/high-speed-warning/ — 双宿主 panel + warningCount widget

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useHighSpeedWarning(caps)` | `useHighSpeedWarning()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/high-speed-warning/
├── hooks/useHighSpeedWarning.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] useHighSpeedWarning：show/toggle/setVisible/destroy
- [ ] Entry 挂载到宿主工具栏或控件区
- [ ] 图层 create/destroy 与 mapId 生命周期绑定
- [ ] Modify 抽屉按需

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `modifyPanels.getVisibleRef` | 右栏显隐 | visibleRef(mapId) |
| `mapView + 图层 API` | 面板开关同步地图叠加 | 宿主 mapApi / Cesium 注入 |

---

## 4. 插件协作

- **toolId**：`high-speed-warning-plugin` · 常量 `HIGH_SPEED_WARNING_PLUGIN_TOOL_ID`

- **并行面板**：不与绘制工具互斥

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
