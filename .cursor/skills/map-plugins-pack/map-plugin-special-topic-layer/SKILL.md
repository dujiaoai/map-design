---
name: map-plugin-special-topic-layer
description: >-
  React 地图「专题图层：专题目录树、勾选加载、透明度与批量设置」能力（类型 parallel-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：专题图层：专题目录树、勾选加载、透明度与批量设置

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`parallel-panel` · **toolId** `special-topic-layer-plugin`（`SPECIAL_TOPIC_LAYER_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

专题图层：专题目录树、勾选加载、透明度与批量设置

### 边界规则

| 不互斥 | 不参与 Coordinator 或空 deactivate |
| 右侧面板 | Modify 抽屉 420px；可与其它工具并行 |
| 双宿主 | OL/Cesium 图层走宿主注入 |

### 功能要点

- 右侧 Modify：目录树 + 勾选加载专题图层
- useSpecialTopicCatalog / useSpecialTopicTreeChecked
- 打开时可与做分析并行（MODIFY 例外）
- 图层移除用 layer.get('nodeId') 匹配
- SpecialTopicLayer.ts: 专题图层插件核心（BasePlugins） 仅负责工具显隐、Coordinator 与 modifyUI（右侧抽屉）；不向地图挂载业务图层。
- 专题目录树（`el-tree`）、搜索过滤、勾选加载/移除专题图层
- 节点定位（`zoomToLayer`）、打开专题目录时与地图上已有专题图层勾选同步
- 单行/批量透明度设置（记忆与已加载图层同步）
- 树上已选图层数量（与勾选一致）、批量设置抽屉
- 行内「定位 / 设置 / 做分析」入口（做分析与 `do-analysis-plugin` 衔接方式以代码为准）
- 插件间禁止互相 import：不得 `import` / `import type` 其它插件目录（如 `demo-plugin`）；跨插件能力仅通过 `IDeps.pluginsManage.getPlugins(toolId)` 与在本插件内自声明的最小接口衔接；宿主需提前 `setPlugins` 注册目标工具（如 demo）。**当前实现中若存在对其它插件路径的静态 import，新增代码应优先改为上述协作方式，避免扩大耦合。**
- Coordinator：`register` 使用 **空 `deactivate`**（切换其它工具不自动关专题图层面板）；以 `descriptor.ts` 为准。
- modifyUI：`load()` 成功后挂载 `SpecialTopicLayerModify`。
- 工具 ID：使用 `SPECIAL_TOPIC_LAYER_PLUGIN_TOOL_ID`（定义于 `@haoxuan/map-core` `constants/toolIds.ts`）。

### 集成注意

- 打开时不收起做分析（MODIFY_PANELS_MUTEX_WHEN_OPENING_SPECIAL_TOPIC）
- OL 图层移除须用 layer.get('nodeId') 勿用 includes(proxy)
- Modify 互斥：见 hooks 内 MODIFY_PANELS_MUTEX 常量

### 行为详述

| 用户动作 | 系统响应 |
|----------|----------|
| 打开专题图层 | visible=true；**不**关闭做分析面板 |
| 勾选叶子节点 | 加载/移除专题图层；更新 getCheckedTopicIdsRef |
| 调整透明度 | 单图层或批量 opacity drawer |
| 关闭面板 | 按 sync 逻辑清理地图图层（nodeId 精确匹配） |

**legend-plugin** 监听 getCheckedTopicIdsRef 联动图例。

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useSpecialTopicLayer(caps)` | `useSpecialTopicLayer()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/special-topic-layer/
├── hooks/useSpecialTopicLayer.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] useSpecialTopicLayer：show/toggle/setVisible/destroy
- [ ] Entry 挂载到宿主工具栏或控件区
- [ ] 图层 create/destroy 与 mapId 生命周期绑定
- [ ] Modify 抽屉按需

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `getCheckedTopicIdsRef` | 供 legend 等订阅 | shared/hooks/useCheckedTopicIds |
| `专题图层 load/remove` | nodeId 精确移除 | useSpecialTopicCatalog |

---

## 4. 插件协作

- **toolId**：`special-topic-layer-plugin` · 常量 `SPECIAL_TOPIC_LAYER_PLUGIN_TOOL_ID`

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
