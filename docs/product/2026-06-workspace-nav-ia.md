# 工作台侧栏信息架构（IA）

> 状态：已定稿（mock） · 2026-06 · 对应 `mock-nav-items.tsx`

## 问题陈述

侧栏若仅按 `map-plugins-catalog` 技术分类堆叠，会出现：

1. **Modify 互斥组**插件与 **图层展示**混在同一「图层」段  
2. **段顺序**不符合用户任务流（先看清图层，再分析，再业务）

## 目标

- 侧栏段按 **用户任务** 排序，段内项按 **pluginType** 归类  
- 与宿主 **Modify 互斥组**、**Coordinator** 一致，减少 Phase C 接入返工  
- 画布 **tool** 仍走方案 C（快捷工具条），避免侧栏过长

## 侧栏结构（定稿 v2）

| 段 | 原则 | 菜单项 | pluginToolId |
| --- | --- | --- | --- |
| **图层** | parallel-panel / display | 专题图层、**景点聚类**、图例 | `special-topic-layer` / `scenic-spots` / `legend` |
| **分析** | modify-panel 互斥组 | 做分析、属性查看、**我的收藏** | `do-analysis` / `property-view` / `favorites` |
| **运营** | 业务 display / 面板 | 看项目、飞行数据、事件… | 见 catalog |
| **机库** | Dock 列 | 列表 / 设置 / 收藏 | uav-workspace |
| **应用** | 路由 | 项目管理、组织设置、外链 | — |

### 归类原则

| pluginType | 侧栏段 | 说明 |
| --- | --- | --- |
| `parallel-panel` / `display` | **图层** | 控制地图上「看见什么」 |
| `modify-panel` | **分析** | Modify 互斥组，含收藏夹编辑流 |
| `tool`（画布交互） | **快捷工具条** | 不进侧栏（方案 C） |

### 段顺序

`图层 → 分析 → 运营 → 机库 → 应用`

### Dock 槽位与互斥

侧栏 **map-module / map-dock-module** 在任意时刻 **全局互斥**：点击新模块会关闭上一个，左侧仅展示 **一个** 上下文面板（无 Tab 叠层）。

**map-module 统一规则**（与运营段一致）：

| 项 | 规则 |
| --- | --- |
| store 槽位 | `activeModuleId`（图层 / 分析 / 运营共用） |
| 路由前缀 | 按段区分：`/data/:moduleId`、`/ops/:moduleId` |
| UI 载体 | `display` → 地图原生 `MapNativeModuleHost`；其余 → 左列 `MapContextPanel` |

| 段 | 路由前缀 | store 槽位 | UI 载体 |
| --- | --- | --- | --- |
| 图层 | `/data/:moduleId` | `activeModuleId` | display → 原生；其余 → 左列 |
| 分析 | `/data/:moduleId` | `activeModuleId` | display → 原生；其余 → 左列 |
| 运营 | `/ops/:moduleId` | `activeModuleId` | display → 原生；其余 → 左列 |
| 机库 | `/uav/:moduleId` | `activeDockModuleId` | 左列 `MapContextPanel` |

同一时刻 store 仅一个模块非空；`display` 不走左列，避免与专题图层等左栏模块叠两层壳。

**侧栏段折叠**：运营 / 机库 / 应用段可独立收起（localStorage），切换左栏模块时**不**自动收起其它段的菜单子项；与左栏模块全局互斥无关。

## 快捷工具条（方案 C）

| 分组 | 示例 |
| --- | --- |
| 量测 | 测距、测面 |
| 标绘 | 绘点、绘线、拾取、定位 |
| 对比 | 卷帘、影像对比 |
| 工具 | 导入、搜索、区划 |

## 验收标准

- [x] `property-view`、`my-favorites` 在「分析」段  
- [x] `scenic-spots` 在「图层」段，标题「景点聚类」  
- [x] `pnpm --filter @repo/saas-web test` 通过  

## Phase 3（产品优化 · 2026-06）

- [x] `MAP_PLUGIN_MODULE_REGISTRY` 登记全部侧栏 module `pluginToolId`
- [x] 命令面板按侧栏段排序，支持 `pluginToolId` 检索
- [x] 运营 / 机库 / 应用段可折叠（localStorage）
- [x] 侧栏模块全局互斥：任意时刻左栏仅一个模块（2026-06）
- [x] 「看项目」高保真 mock 预览
- [ ] Phase C MapProvider bridge 接入（见 [roadmap.md](./roadmap.md)）

## 参考

- [map-plugins-catalog.md](../architecture/map-plugins-catalog.md)  
- [map-workspace-ui.md](../architecture/map-workspace-ui.md)
