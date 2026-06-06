---
name: map-plugin-property-view
description: >-
  React 地图「属性查看：专题图选择 + 地图叠加专题图层」能力（类型 modify-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：属性查看：专题图选择 + 地图叠加专题图层（不含高清影像底图）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`modify-panel` · **toolId** `property-view-plugin`（`PROPERTY_VIEW_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

属性查看：专题图选择 + 地图叠加专题图层（不含高清影像底图）

### 边界规则

| 右侧面板 | Modify 420px |
| Modify 互斥 | 与做分析/收藏/导入/报告互斥 |
| Coordinator | 被其它工具顶掉时**保持抽屉展开**（便于与测量并行查看） |
| 边界 | 不含 ortho 底图；专题图层 API 走宿主/map-core 等价实现 |

### 功能要点

- 右侧 Modify：SpecialTopicSelect + 属性操作区
- applySpecialTopicLayersToMap 叠加图层
- show 时 coordinator.register；被顶掉时仅 unregister 不收起抽屉
- 不依赖 getBaseMapData
- PropertyView.ts: 属性查看插件：继承 BasePlugins，通过 modifyUI 挂载右侧抽屉。 专题图层由 PropertyViewModify 内 applySpecialTopicLayersToMap 管理（与高清影像底图解耦）。
- Coordinator：`show` 时 `register`，用户手动关闭时 `unregister`；被其它工具激活顶掉时仅 `unregister`、**不自动收起**右侧抽屉，便于与测量等并行查看。
- 工具 ID：从 `@haoxuan/map-core` 的 `constants/toolIds.ts` 导入。
- 修改后：`pnpm --filter @haoxuan/map-plugins check:types`。

### 行为详述

| 用户动作 | 系统响应 |
|----------|----------|
| 打开属性查看 | Modify 互斥；register coordinator；挂载 Modify |
| 选择专题图 | applySpecialTopicLayersToMap 更新地图图层 |
| 激活测量/绘制工具 | unregister coordinator；**抽屉仍可见** |
| 用户手动关闭 | unregister + visible=false + 清理专题图层（按产品） |

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `usePropertyView(caps)` | `usePropertyView()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/property-view/
├── hooks/usePropertyView.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] toolId：`property-view-plugin`
- [ ] Modify 内专题选择与 applySpecialTopicLayersToMap
- [ ] coordinator：顶掉时不强制关抽屉
- [ ] 不请求底图 getBaseMapData

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `applySpecialTopicLayersToMap` | 专题图选择后上图 | map-core 专题 API |
| `coordinator（弱关抽屉）` | 被顶掉不收起 Modify | PropertyView.ts |

---

## 4. 插件协作

- **toolId**：`property-view-plugin` · 常量 `PROPERTY_VIEW_PLUGIN_TOOL_ID`
- **Modify 互斥组**：打开前 `modifyPanels.closeSiblingExcept`


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
