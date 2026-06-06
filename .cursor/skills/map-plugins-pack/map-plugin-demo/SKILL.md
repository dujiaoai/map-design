---
name: map-plugin-demo
description: >-
  React 地图「打点标绘开发模板」能力（类型 tool-template）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：打点标绘开发模板（与 interest-point-plugin 同 toolId）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool-template` · **toolId** `interest-point-plugin`（`INTEREST_POINT_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

打点标绘开发模板（与 interest-point-plugin 同 toolId）

### 边界规则

| 开发模板 | 与 interest-point 同 toolId |
| 工具类 | Coordinator 互斥 + catalogPlotLayer + Modify 全 Tab |

### 功能要点

- 与 interest-point 共用 INTEREST_POINT_PLUGIN_TOOL_ID
- 完整 tool 链：Coordinator + catalogPlotLayer + Modify 五 Tab
- 新插件复制 demo-plugin 目录并重命名

### 集成注意

- React 迁移请对照 map-plugin-interest-point，非本目录

### 产品规格摘要

### 1. 插件概述

| 项           | 填写                                                  |
| ------------ | ----------------------------------------------------- |
| **插件名**   | `demo-plugin`                                         |
| **用途**     | 点绘制开发模板：演示 BasePlugins + Coordinator 最小链 |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core    |
| **toolId**   | 与 `interest-point-plugin` 共用（迁移对照 interest-point） |

---

### 2. 必选能力（模板）

- [ ] 复制目录 → 重命名 core/hooks/widgets/descriptor/lazyEntry
- [ ] 在 map-core 注册独立 `*_PLUGIN_TOOL_ID`（勿与生产插件冲突）
- [ ] Coordinator register/unregister
- [ ] Entry + Panel + Modify 五 Tab 结构
- [ ] createXxxPluginLazyEntry 懒加载

---

### 3. 技术约束

- 完整实现参考：`interest-point-plugin/REQUIREMENTS.md`
- React 迁移对照：`map-plugin-interest-point` skill（非本目录 Vue 代码）

---

### 4. 可选能力

- [ ] 作为 CI/文档样例保留最小 stub

---

### 5. 执行约束（How）

详见 [interest-point-plugin/AGENTS.md](../interest-point-plugin/AGENTS.md) 与父包 [AGENTS.md](../AGENTS.md)。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useDemo(caps)` | `useDemo()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/demo/
├── hooks/useDemo.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] map-core toolId：`INTEREST_POINT_PLUGIN_TOOL_ID`（与 interest-point 同值）
- [ ] useDemo：ensureLoaded → setPlugins → loader；start/stop register/unregister
- [ ] Entry：ActionBarItem + Exit
- [ ] Core：绘制/测量/编辑逻辑 + catalogPlotLayer
- [ ] Panel + Modify（对齐 DemoModify Tab 结构）
- [ ] openEditFromPreview 转发（目录标绘类）
- [ ] 单测 core 纯逻辑

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `coordinator.register/unregister` | 工具激活/切换互斥 | deps.coordinator |
| `catalogPlotLayer` | 点标绘写入统一矢量源 | BaseOlMap.getOrCreateCatalogPlotLayer() |
| `pluginsManage.ensureLoaded` | 懒加载 | deps.pluginsManage |

---

## 4. 插件协作

- **toolId**：`interest-point-plugin` · 常量 `INTEREST_POINT_PLUGIN_TOOL_ID`



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
