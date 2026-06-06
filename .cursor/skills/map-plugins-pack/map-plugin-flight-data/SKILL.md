---
name: map-plugin-flight-data
description: >-
  React 地图「飞行数据右侧面板」能力（类型 parallel-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：飞行数据右侧面板（OL/Cesium 双宿主）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`parallel-panel` · **toolId** `flight-data-plugin`（`FLIGHT_DATA_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

飞行数据右侧面板（OL/Cesium 双宿主）

### 边界规则

| 不互斥 | 不参与 Coordinator 或空 deactivate |
| 右侧面板 | Modify 抽屉 420px；可与其它工具并行 |
| 双宿主 | OL/Cesium 图层走宿主注入 |

### 功能要点

- FunctionCard「飞行数据」；权限 canShowFlightData
- 可选 AI 事件预警 badge（aiEventWarningCount）
- FlightDataCesiumShell / FlightDataPanel 双宿主
- 子模块：飞行日志、AI 预警等 widgets
- FlightData.ts: 飞行数据插件核心（BasePlugins） 仅负责工具显隐与 modifyUI（左侧抽屉）；不向地图挂载业务图层。
- FlightDataCesiumShell.ts: Cesium 宿主下的飞行数据左侧壳：不继承 BasePlugins（避免依赖 mapApi），仅挂载 Modify 与宿主 appContext 对齐。

### 集成注意

- 不与绘制工具 Coordinator 互斥
- 业务渐进接入中

### 行为详述

FunctionCard 打开右栏 420px；权限 canShowFlightData。双宿主 Shell：OL FlightDataPanel / Cesium FlightDataCesiumShell。关闭时清理飞行相关地图叠加。

### React 架构建议

src/features/flight-data/ — FlightDataPanel + FlightDataCesiumShell；hooks/useFlightData；并行不互斥

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useFlightData(caps)` | `useFlightData()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/flight-data/
├── hooks/useFlightData.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] useFlightData：show/toggle/setVisible/destroy
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

- **toolId**：`flight-data-plugin` · 常量 `FLIGHT_DATA_PLUGIN_TOOL_ID`

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
