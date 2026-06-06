# 地图宿主契约 — reference

## toolId 常量表

实现时在 `src/map/constants/toolIds.ts`（或等价位置）声明，**字符串值必须与下表一致**以便插件互操作。

| 常量名（建议） | toolId 字符串 |
|----------------|---------------|
| INTEREST_POINT_PLUGIN_TOOL_ID | `interest-point-plugin` |
| MEASURE_DISTANCE_PLUGIN_TOOL_ID | `measure-distance-plugin` |
| MEASURE_AREA_PLUGIN_TOOL_ID | `measure-area-plugin` |
| MEASURE_ANGLE_PLUGIN_TOOL_ID | `measure-angle-plugin` |
| MEASURE_AZIMUTH_ANGLE_PLUGIN_TOOL_ID | `measure-azimuth-angle-plugin` |
| DRAW_FANSHAPE_PLUGIN_TOOL_ID | `draw-fanshape-plugin` |
| DRAW_ELLIPSE_PLUGIN_TOOL_ID | `draw-ellipse-plugin` |
| DRAW_CIRCLE_PLUGIN_TOOL_ID | `draw-circle-plugin` |
| PICK_MAP_POINT_PLUGIN_TOOL_ID | `pick-map-point-plugin` |
| LOCATE_MAP_POINT_PLUGIN_TOOL_ID | `locate-map-point-plugin` |
| PANORAMA_MULTIPLE_PLUGIN_TOOL_ID | `panorama-multiple-plugin` |
| BRUSH_PLUGIN_TOOL_ID | `brush-plugin` |
| PLUGIN_OVERLAY_TOGGLE_PLUGIN_TOOL_ID | `plugin-overlay-toggle-plugin` |
| SCENIC_SPOTS_PLUGIN_TOOL_ID | `scenic-spots-plugin` |
| ORTHO_IMAGERY_PLUGIN_TOOL_ID | `ortho-imagery-plugin` |
| ORTHO_IMAGERY_COMPARISON_PLUGIN_TOOL_ID | `ortho-imagery-comparison-plugin` |
| DO_ANALYSIS_PLUGIN_TOOL_ID | `do-analysis-plugin` |
| FAVORITES_PLUGIN_TOOL_ID | `favorites-plugin` |
| MAP_SEARCH_PLUGIN_TOOL_ID | `map-search-plugin` |
| VIEW_PROJECT_PLUGIN_TOOL_ID | `view-project-plugin` |
| DATA_MAKE_PLUGIN_TOOL_ID | `data-make-plugin` |
| EVENTS_PLUGIN_TOOL_ID | `events-plugin` |
| PROJECT_PLOT_PLUGIN_TOOL_ID | `project-plot-plugin` |
| PROPERTY_VIEW_PLUGIN_TOOL_ID | `property-view-plugin` |
| SPECIAL_TOPIC_LAYER_PLUGIN_TOOL_ID | `special-topic-layer-plugin` |
| UAV_PLUGIN_TOOL_ID | `uav-plugin` |
| GOTO_REPORT_PLUGIN_TOOL_ID | `goto-report-plugin` |
| COMPARISON_PLUGIN_TOOL_ID | `comparison-plugin` |
| PANORAMA_ROAM_PLUGIN_TOOL_ID | `panorama-roam-plugin` |
| IMPORT_FILE_PLUGIN_TOOL_ID | `import-file-plugin` |
| FLIGHT_DATA_PLUGIN_TOOL_ID | `flight-data-plugin` |
| HIGH_SPEED_WARNING_PLUGIN_TOOL_ID | `high-speed-warning-plugin` |
| HEATMAP_MVT_OL_PLUGIN_TOOL_ID | `event-heatmap-mvt-ol-plugin` |

---

## Modify 互斥组（MODIFY_PANELS_MUTEX_TRIPLET + 扩展）

打开以下任一面板前，应关闭同组其它面板：

- `do-analysis-plugin`
- `property-view-plugin`
- `favorites-plugin`
- `import-file-plugin`
- `goto-report-plugin`

**例外**：

- 打开 `special-topic-layer-plugin` 时**不**强制关闭 `do-analysis-plugin`
- 打开 `do-analysis-plugin` 时**不**强制关闭 `special-topic-layer-plugin`

---

## 并行面板（不与 Coordinator 互斥）

- `uav-plugin`
- `special-topic-layer-plugin`
- `flight-data-plugin`
- `high-speed-warning-plugin`

---

## 云眼 Monorepo API 对照（可选）

仅在 YunYan 仓库内开发时参考：

| 本契约 | 云眼 @haoxuan/map-core |
|--------|------------------------|
| MapHostCapabilities | `IDeps` / `IMapCesiumDeps`（`MapHostDeps`） |
| coordinator | `deps.coordinator` |
| pluginsManage | `deps.pluginsManage` |
| modifyPanels.closeSiblingExcept | `closeSiblingModifyPanelsExcept(deps, exceptToolId, panels)` |
| catalogPlotLayer | `BaseOlMap.getOrCreateCatalogPlotLayer()` |
| useMapHost() | `useMapHostDeps()` / `useMapContext()` |

Vue 插件源码根：`packages-map/map-plugins/src/`  
插件类型说明：`packages-map/map-plugins/PLUGIN-TYPES.md`

---

## 其它项目 `.cursor/rules/map-host.mdc` 模板

```markdown
---
description: 本项目地图宿主实现位置
globs: src/map/**/*
---

地图宿主契约遵循 skill `map-workspace-host-react`。
实现路径：`src/map/host/`（MapHostProvider、Coordinator、modifyPanels）。
toolId 常量：`src/map/constants/toolIds.ts`。
具体插件实现前 @map-plugin-{name} 与 @map-workspace-host-react。
```
