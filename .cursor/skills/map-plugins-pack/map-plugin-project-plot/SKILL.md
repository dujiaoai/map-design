---
name: map-plugin-project-plot
description: >-
  React 地图「工程标绘：工程范围正射瓦片加载、期数切换与显隐」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：工程标绘：工程范围正射瓦片加载、期数切换与显隐

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `project-plot-plugin`（`PROJECT_PLOT_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

工程标绘：工程范围正射瓦片加载、期数切换与显隐

### 边界规则

| Coordinator 互斥 | show/hide 时 register/unregister |
| 瓦片 | TyLayer + switchPeriod 替换期数 |
| Modify | 期数列表抽屉 |

### 功能要点

- Entry 切换工程高清影像显隐
- TyLayer 加密瓦片（EncryptedTiled 委托 map-core 解密栈）
- Modify 期数切换 switchPeriod
- Coordinator 互斥：show register / hide unregister
- ProjectPlotPlugin.ts: 高清影像（正射影像）图层 对齐 OrthoMap.js 功能：支持 URL 列表加载、mapServers 配置加载、期数切换、显示/隐藏
- Coordinator：通过 `PROJECT_PLOT_PLUGIN_TOOL_ID` 实现互斥；show 时 register，hide/unmounted 时 unregister
- modifyUI：descriptor 定义 `modifyUI`，core 在 load 成功后挂载 DoAnalysisModify
- 工具 ID：从 `@haoxuan/map-core` 的 `constants/toolIds.ts` 导入，禁止硬编码

### 行为详述

| 用户动作 | 系统响应 |
|----------|----------|
| 打开工程标绘 | register；加载 TyLayer；Modify 显示期数 |
| switchPeriod | replaceBaseMapLayersFromConfigs / 内部 switchPeriod |
| setVisible(false) | 隐藏 ortho 图层；unregister |

**宿主需知**：加密 XYZ 解密能力需由 map 引擎或宿主提供（云眼：EncryptedXYZSource）。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useProjectPlot(caps)` | `useProjectPlot()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/project-plot/
├── core/
├── hooks/useProjectPlot.ts
├── components/
│   ├── ProjectPlotEntry.tsx
│   ├── ProjectPlotPanel.tsx
│   └── ProjectPlotModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`project-plot-plugin`（常量建议名 `PROJECT_PLOT_PLUGIN_TOOL_ID`）
- [ ] useProjectPlot：ensureLoaded → register；start/stop 走 coordinator
- [ ] Entry：工具栏项 + 退出
- [ ] Core：纯 TS，地图交互 + catalogPlotLayer（标绘类）
- [ ] Panel + Modify（属性/数据/样式/设置/工具 Tab）
- [ ] 单测 core 纯逻辑

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `EncryptedXYZ / TyLayer` | 加密正射瓦片 | libs/TyLayer + map-core |
| `coordinator` | 工具互斥 | register on show |

---

## 4. 插件协作

- **toolId**：`project-plot-plugin` · 常量 `PROJECT_PLOT_PLUGIN_TOOL_ID`


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
