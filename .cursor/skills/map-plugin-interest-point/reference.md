# interest-point-plugin — 契约参考

## 概述

兴趣点标绘：点击地图放置点要素，Panel 列表 + Modify 五 Tab 编辑

| 属性 | 值 |
|------|-----|
| 类型 | tool |
| toolId | `interest-point-plugin` |
| 常量名 | `INTEREST_POINT_PLUGIN_TOOL_ID` |
| Coordinator | 互斥工具 |
| lazyEntry | 有 |
| 双宿主 | 否 |

## 集成模式

1. pluginsManage.setPlugins → ensureLoaded → register
2. start/stop 走 coordinator
3. 卸载 destroy

## 产品规格摘要

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

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `catalogPlotLayer` | 点标绘写入 | getOrCreateCatalogPlotLayer |
| `openEditFromPreview` | 收藏夹地图点击 | descriptor 转发 |

## 互斥与协作

- 工具类：Coordinator 互斥


## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
