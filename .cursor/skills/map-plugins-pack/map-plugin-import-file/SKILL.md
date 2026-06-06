---
name: map-plugin-import-file
description: >-
  React 地图「导入矢量/文件到目录标绘层」能力（类型 modify-panel）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：导入矢量/文件到目录标绘层

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`modify-panel` · **toolId** `import-file-plugin`（`IMPORT_FILE_PLUGIN_TOOL_ID`）

---

## 1. 产品契约

### 定位

导入矢量/文件到目录标绘层

### 边界规则

| 右侧面板 | Modify 抽屉 420px |
| 互斥组 | 与做分析/属性/收藏/导入/报告同属 Modify 组 |
| 无绘制 | 通常无地图绘制交互 |

### 功能要点

- 工具箱入口 + 右侧导入面板
- 打开前 closeSiblingModifyPanelsExcept（MODIFY_PANELS_MUTEX_TRIPLET）
- 支持 shp/kml 等导入 catalogPlotLayer
- ImportFilePanel.ts: 地图导入插件：右侧 Modify 侧栏挂载与显隐

### 行为详述

打开前 Modify 互斥。用户选择文件 → 解析几何 → 写入 catalogPlotLayer 统一源；样式走 catalog 解析器注册表。

### React 架构建议

src/features/import-file/ — ImportModify + 文件解析 → catalogPlotLayer

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useImportFile(caps)` | `useImportFile()` + MapHostProvider |
| lazyEntry loader | `React.lazy` + 首次交互 `ensureLoaded` |
| Modify 抽屉 | `lazy(() => import('./Modify'))` |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/import-file/
├── hooks/useImportFile.ts
├── components/
├── core/
└── index.ts
```

### Checklist

- [ ] useImportFile：打开前 modifyPanels.closeSiblingExcept
- [ ] Modify 右栏 420px；visibleRef 按 mapId
- [ ] 无绘制态；仅面板交互

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `modifyPanels.closeSiblingExcept` | 打开前关闭同组面板 | closeSiblingModifyPanelsExcept |
| `modifyPanels.getVisibleRef` | 右栏 420px 显隐 | visibleRef(mapId) |

---

## 4. 插件协作

- **toolId**：`import-file-plugin` · 常量 `IMPORT_FILE_PLUGIN_TOOL_ID`
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
