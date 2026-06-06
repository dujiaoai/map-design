---
name: map-plugin-comparison
description: >-
  React 地图「卷帘/分屏地图对比」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：卷帘/分屏地图对比（工具条 + 左侧参数抽屉）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `comparison-plugin`（`COMPARISON_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

卷帘/分屏地图对比（工具条 + 左侧参数抽屉）

### 边界规则

| Coordinator 互斥 | 激活时 `register`，切换其它工具 `deactivate` |
| 左侧抽屉 | BasePluginsModifyLeftBar 配置卷帘/分屏参数（非右侧 Modify） |
| Esc 退出 | 键盘退出对比模式 |

### 功能要点

- 工具栏 Swipe 图标；Esc 退出对比
- 左侧 Modify 抽屉（BasePluginsModifyLeftBar）配置对比参数
- Coordinator 互斥；visibleRef 按 mapId
- 核心 Comparison 类继承 BasePlugins
- Comparison.ts: comparison-plugin 核心（卷帘对比） 负责工具显隐、Coordinator 与 modifyUI（左侧抽屉）；具体卷帘地图逻辑可在 Modify 或后续扩展中接入。

### 行为详述

| 用户动作 | 系统响应 |
|----------|----------|
| 点击 Swipe 工具 | register；打开左侧 ModifyLeftBar 配置卷帘 |
| Esc | 退出对比；unregister；清理卷帘图层 |
| 切换其它绘制工具 | coordinator deactivate 停对比 |

### React 架构建议

src/features/comparison/ — Core 卷帘/分屏 + ModifyLeftBar（非五 Tab）

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useComparison(caps)` | `useComparison()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/comparison/
├── core/
├── hooks/useComparison.ts
├── components/
│   ├── ComparisonEntry.tsx
│   ├── ComparisonPanel.tsx
│   └── ComparisonModify.tsx
└── index.ts
```

### Checklist

- [ ] map-core toolId：`COMPARISON_PLUGIN_TOOL_ID`
- [ ] useComparison：ensureLoaded → lazyEntry → start/stop register/unregister
- [ ] Entry：Swipe 工具栏图标 + Exit
- [ ] Core Comparison：卷帘/分屏地图逻辑
- [ ] ModifyLeftBar：对比参数配置（非 DemoModify 五 Tab）
- [ ] Esc 监听退出对比

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `coordinator` | 卷帘工具互斥 | COMPARISON_PLUGIN_TOOL_ID |

---

## 4. 插件协作

- **toolId**：`comparison-plugin` · 常量 `COMPARISON_PLUGIN_TOOL_ID`


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
