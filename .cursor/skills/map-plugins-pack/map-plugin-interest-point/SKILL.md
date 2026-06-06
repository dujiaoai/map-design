---
name: map-plugin-interest-point
description: >-
  React 地图「兴趣点标绘：点击地图放置点要素，Panel 列表 + Modify 五 Tab 编辑」能力（类型 tool）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：兴趣点标绘：点击地图放置点要素，Panel 列表 + Modify 五 Tab 编辑

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`tool` · **toolId** `interest-point-plugin`（`INTEREST_POINT_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

兴趣点标绘：点击地图放置点要素，Panel 列表 + Modify 五 Tab 编辑

### 边界规则

| Coordinator 互斥 | 激活时 register，切换其它工具 deactivate 停绘 |
| 目录标绘 | 业务几何写入 catalogPlotLayer；注册样式解析器 |
| Modify | 属性/数据/样式/设置/工具 Tab |

### 功能要点

- 点击地图添加 Point；Coordinator 互斥
- InterestPointPanel 要素列表；Modify 属性/数据/样式/设置 Tab
- catalogPlotLayer + openEditFromPreview（收藏夹）
- drawPointIconCatalog 常规/应急图标；plotSave 目录持久化
- INTEREST_POINT_PLUGIN_TOOL_ID
- plotSave.ts: 兴趣点点标绘：复用 {@link ../../shared/pluginPlotSave}
- style.ts: demo 点图层 z-index；样式解析与 OL Style 创建在 @haoxuan/map-core shared/plotPointStyle。
- 必须：遵循 `PointStyle` 字段、执行 `check:types`、遵守 coordinator 互斥约定
- 先询问：新增 Point 几何类型、调整 descriptor API、在 map-core 中修改 BasePlugins
- 禁止：硬编码 API 密钥、绕过 coordinator、在 map-core 核心中超出插件扩展点进行修改

### 产品规格摘要

### 1. 插件概述

| 项           | 填写                                                                 |
| ------------ | -------------------------------------------------------------------- |
| **插件名**   | `interest-point-plugin`                                              |
| **用途**     | 兴趣点标绘：点击地图放置 Point 要素，Panel 列表 + Modify 五 Tab 编辑 |
| **技术栈**   | Vue 3、OpenLayers、Element Plus、@haoxuan/map-core                   |
| **参考模板** | demo-plugin（同 toolId，生产实现以本插件为准）                       |

---

### 2. 必选能力

- [x] 点击地图放置 Point 要素（Coordinator 互斥）
- [x] 要素列表面板（InterestPointPanel），展示已添加的点
- [x] 编辑抽屉（InterestPointModify）：属性 / 数据 / 样式 / 设置 Tab（工具 Tab 默认隐藏）
- [x] 设置 Tab：显示名称、保存路径、常规/应急图标（drawPointIconCatalog）
- [x] 目录标绘：写入 catalogPlotLayer；registerCatalogPlotStyleResolver
- [x] `openEditFromPreview`：收藏夹预览点击地图点进入编辑
- [x] plotSave：新建/更新/删除兴趣点目录文件（`saveInterestPointPlotNew` 等）
- [x] 懒加载入口（createInterestPointPluginLazyEntry）供宿主按需加载

---

### 3. 技术约束

### 文件与职责

| 路径                                              | 职责                                                         |
| ------------------------------------------------- | ------------------------------------------------------------ |
| `core/InterestPoint.ts`                           | 主类，继承 BasePlugins；点击添加 Point、openEditFromPreview |
| `core/style.ts`                                   | PointStyle 解析与应用；catalog 样式解析器                    |
| `core/plotSave.ts`                                | 兴趣点目录保存/更新/删除                                     |
| `drawPointIconCatalog.ts`                         | 常规/应急图标目录                                            |
| `descriptor/descriptor.ts`                        | createInterestPointPluginDescriptor(deps)                    |
| `lazyEntry/lazyEntry.ts`                          | createInterestPointPluginLazyEntry()                         |…

### 4. 功能交互

- start：register；点击地图添加 Point；自动 catalog 保存（可配置路径）
- 点击 Panel 中要素：打开 Modify 编辑样式/属性
- 收藏夹地图点点击：descriptor.openEditFromPreview 激活编辑
- stop：unregister；退出绘制态
- 删除：Modify footer 删除按钮 → deleteInterestPointPlotFile

---

### 5. 执行约束（How）

Definition of Done、When Blocked、边界等**操作约束**详见 [AGENTS.md](./AGENTS.md) 对应章节。

---

### 行为详述

| 动作 | 响应 |
|------|------|
| start | register；点击地图 add Point |
| 点击列表项 | 打开 Modify 编辑样式 |
| stop | unregister；退出绘制态 |
| 收藏夹点击地图点 | descriptor.openEditFromPreview |

**Modify 对齐**：属性 / 数据 / 样式 / 设置 / 工具 Tab。

### React 架构建议

src/features/interest-point/ — core + useInterestPoint + Entry/Panel/Modify + descriptor/lazyEntry

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useInterestPoint(caps)` | `useInterestPoint()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| coordinator.register/unregister | start/stop 生命周期 |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/interest-point/
├── core/
├── hooks/useInterestPoint.ts
├── components/
│   ├── InterestPointEntry.tsx
│   ├── InterestPointPanel.tsx
│   └── InterestPointModify.tsx
└── index.ts
```

### Checklist

- [ ] toolId：`interest-point-plugin`（INTEREST_POINT_PLUGIN_TOOL_ID）
- [ ] openEditFromPreview 必须转发（收藏夹）
- [ ] registerCatalogPlotStyleResolver
- [ ] 单测 core/style.ts

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `catalogPlotLayer` | 点标绘写入 | getOrCreateCatalogPlotLayer |
| `openEditFromPreview` | 收藏夹地图点击 | descriptor 转发 |

---

## 4. 插件协作

- **toolId**：`interest-point-plugin` · 常量 `INTEREST_POINT_PLUGIN_TOOL_ID`


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
