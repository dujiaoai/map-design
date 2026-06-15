# 产品路线图（map-design / saas-web）

> 状态：Living doc · 2026-06 · 与 [工作台侧栏 IA](./2026-06-workspace-nav-ia.md) 对齐

## Now（当前迭代）

| 项 | 说明 | 状态 |
| --- | --- | --- |
| 侧栏 IA v2 | 图层 → 分析 → 运营 → 机库 → 应用 | ✅ 已定稿 |
| pluginToolId registry | 快捷工具 11 项 + 侧栏模块 14 项登记 | ✅ |
| Mock 模块预览 | Fallback 展示 plugin 元数据；看项目/专题/收藏/飞行数据高保真 | 🔄 进行中 |
| 命令面板 | 按侧栏段排序；支持 pluginToolId 检索 | ✅ |
| 侧栏段折叠 | 运营 / 机库 / 应用可折叠并持久化 | ✅ |

## Next（下一迭代）

| 项 | 说明 | 依赖 |
| --- | --- | --- |
| Phase C · MapProvider | `MapPluginBridgeProvider` + lazy loader 脚手架 ✅；packages-map 联调待接 | packages-map |
| Modify 互斥组 | `modifyPanels.closeSiblingExcept` 与 store 对齐 | 宿主 bridge |
| 高保真 mock 扩展 | 做分析、属性查看、事件等模块 UI | registry-catalog |
| 租户能力门控 | `tenantFeature` 与后端能力开关联调 | 鉴权 API |
| 机库 Dock | uav-workspace 三项接真实数据 | 机库服务 |

## Later（后续）

| 项 | 说明 |
| --- | --- |
| 底图与 map-chrome | 指北针、比例尺、底图切换等 chrome 插件 |
| Cesium 三维套件 | cesium-toolkit 类插件统一入口 |
| 全局搜索联调 | POI 检索与 `map-search-plugin` 真实结果 |
| 插件按需加载策略 | `pluginsManage.ensureLoaded` + 预加载热点模块 |

## 验收节奏

1. **Mock 阶段**：侧栏 / Dock / URL / 命令面板行为一致，`pnpm --filter @repo/saas-web test` 通过  
2. **Bridge 阶段**：DEV 控制台无 unknown `pluginToolId` 警告  
3. **集成阶段**：P0 模块（专题图层、看项目、测距）可在地图画布上操作  

## 参考

- [map-plugins-catalog.md](../architecture/map-plugins-catalog.md)
- [map-plugin-integration.md](../architecture/map-plugin-integration.md)
- [2026-06-project-standards.md](./2026-06-project-standards.md)
