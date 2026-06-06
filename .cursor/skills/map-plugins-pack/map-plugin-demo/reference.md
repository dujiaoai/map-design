# demo-plugin — 契约参考

## 概述

打点标绘开发模板（与 interest-point-plugin 同 toolId）

| 属性 | 值 |
|------|-----|
| 类型 | tool-template |
| toolId | `interest-point-plugin` |
| 常量名 | `INTEREST_POINT_PLUGIN_TOOL_ID` |
| Coordinator | 无 |
| lazyEntry | 无/轻量 Entry |
| 双宿主 | 否 |

## 集成模式

1. 宿主挂载 Entry
2. 首次交互 new Core(caps)
3. 卸载 destroy 图层

## 产品规格摘要

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

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `coordinator.register/unregister` | 工具激活/切换互斥 | deps.coordinator |
| `catalogPlotLayer` | 点标绘写入统一矢量源 | BaseOlMap.getOrCreateCatalogPlotLayer() |
| `pluginsManage.ensureLoaded` | 懒加载 | deps.pluginsManage |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
