---
name: map-plugins-index
description: >-
  React 地图插件 skill 索引（可移植）。按能力分类；实现前必读 map-workspace-host-react。
---

# map-plugins Skill 索引

> **版本**：1.3.1 · 可移植 skill 包  
> **必读宿主**：[`map-workspace-host-react`](../map-workspace-host-react/SKILL.md)

## 其它项目接入

1. 拷贝 `map-workspace-host-react` + `map-plugins-index` + 需要的 `map-plugin-*`
2. 在本项目 `.cursor/rules/map-host.mdc` 声明宿主实现路径
3. 实现插件前 `@map-workspace-host-react` + `@map-plugin-xxx`
4. 打包：`node scripts/pack-map-plugin-skills.mjs`

## 使用方式

1. **先读** [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
2. 按分类选型，`@map-plugin-{name}`
3. 工具模板：[map-plugin-interest-point](../map-plugin-interest-point/SKILL.md)
4. 机库：[uav-workspace-react](../uav-workspace-react/SKILL.md)

## 按能力分类

### 底图与控件

| 插件 | Skill | 类型 | 说明 |
|------|-------|------|------|
| base-map-switcher-cesium-plugin | [map-plugin-base-map-switcher-cesium](../map-plugin-base-map-switcher-cesium/SKILL.md) | map-chrome | Cesium 三维底图切换面板 |
| base-map-switcher-plugin | [map-plugin-base-map-switcher](../map-plugin-base-map-switcher/SKILL.md) | map-chrome | 右下角底图切换：正射/电子地图/全景漫游与区划路网复选 |
| base-map-vec-plugin | [map-plugin-base-map-vec](../map-plugin-base-map-vec/SKILL.md) | map-chrome | 电子地图与影像底图互斥切换 |
| compass-cesium-plugin | [map-plugin-compass-cesium](../map-plugin-compass-cesium/SKILL.md) | map-chrome | Cesium 三维指北针控件 |
| compass-plugin | [map-plugin-compass](../map-plugin-compass/SKILL.md) | map-chrome | 二维地图指北针/罗盘控件 |
| region-navigator-plugin | [map-plugin-region-navigator](../map-plugin-region-navigator/SKILL.md) | map-chrome | 行政区划导航：Popover 区划面板与围栏图层 |
| restore-map-view-extent-plugin | [map-plugin-restore-map-view-extent](../map-plugin-restore-map-view-extent/SKILL.md) | map-chrome | 恢复地图初始视图范围 |
| scale-bar-plugin | [map-plugin-scale-bar](../map-plugin-scale-bar/SKILL.md) | map-chrome | 数字比例尺（1:N）控件 |
| zoom-control-cesium-plugin | [map-plugin-zoom-control-cesium](../map-plugin-zoom-control-cesium/SKILL.md) | map-chrome | Cesium 三维缩放控件 |
| zoom-control-plugin | [map-plugin-zoom-control](../map-plugin-zoom-control/SKILL.md) | map-chrome | 二维缩放 +/- 控件 |

### 量测与绘制

| 插件 | Skill | 类型 | 说明 |
|------|-------|------|------|
| brush-plugin | [map-plugin-brush](../map-plugin-brush/SKILL.md) | tool | 画笔：按住拖拽绘制自由路径 |
| comparison-plugin | [map-plugin-comparison](../map-plugin-comparison/SKILL.md) | tool | 卷帘/分屏地图对比（工具条 + 左侧参数抽屉） |
| demo-plugin | [map-plugin-demo](../map-plugin-demo/SKILL.md) | tool-template | 打点标绘开发模板（与 interest-point-plugin 同 t |
| draw-circle-plugin | [map-plugin-draw-circle](../map-plugin-draw-circle/SKILL.md) | tool | 画圆：圆心 + 圆上一点确定半径 |
| draw-ellipse-plugin | [map-plugin-draw-ellipse](../map-plugin-draw-ellipse/SKILL.md) | tool | 画椭圆：圆心 + 长轴 + 短轴三点 |
| draw-fanshape-plugin | [map-plugin-draw-fanshape](../map-plugin-draw-fanshape/SKILL.md) | tool | 画扇形：圆心 + 半径边 + 弧度边 |
| interest-point-plugin | [map-plugin-interest-point](../map-plugin-interest-point/SKILL.md) | tool | 兴趣点标绘：点击地图放置点要素，Panel 列表 + Modify 五  |
| locate-map-point-plugin | [map-plugin-locate-map-point](../map-plugin-locate-map-point/SKILL.md) | tool | 地图定点定位（输入坐标定位） |
| measure-angle-plugin | [map-plugin-measure-angle](../map-plugin-measure-angle/SKILL.md) | tool | 测夹角：顶点处显示两线段夹角（度） |
| measure-area-plugin | [map-plugin-measure-area](../map-plugin-measure-area/SKILL.md) | tool | 测面：多边形顶点、双击完成、显示地理面积 |
| measure-azimuth-angle-plugin | [map-plugin-measure-azimuth-angle](../map-plugin-measure-azimuth-angle/SKILL.md) | tool | 测方位角：夹角度数 + 东南西北方向 |
| measure-distance-plugin | [map-plugin-measure-distance](../map-plugin-measure-distance/SKILL.md) | tool | 测距：折线顶点、双击完成、显示地理距离 |
| pick-map-point-plugin | [map-plugin-pick-map-point](../map-plugin-pick-map-point/SKILL.md) | tool | 地图选点拾取坐标 |

### 业务面板

| 插件 | Skill | 类型 | 说明 |
|------|-------|------|------|
| data-make-plugin | [map-plugin-data-make](../map-plugin-data-make/SKILL.md) | modify-panel | 全景制作：工具栏 + 右侧 Modify 壳（业务渐进接入） |
| do-analysis-plugin | [map-plugin-do-analysis](../map-plugin-do-analysis/SKILL.md) | modify-panel | 做分析：工具栏入口 + 右侧分析抽屉壳（不含 identify/出图业务 |
| favorites-plugin | [map-plugin-favorites](../map-plugin-favorites/SKILL.md) | modify-panel | 收藏夹：目录树、标绘预览、点击地图要素打开对应工具编辑 |
| goto-report-plugin | [map-plugin-goto-report](../map-plugin-goto-report/SKILL.md) | modify-panel | 跳转报表/附件上传与详情 |
| import-file-plugin | [map-plugin-import-file](../map-plugin-import-file/SKILL.md) | modify-panel | 导入矢量/文件到目录标绘层 |
| map-search-plugin | [map-plugin-map-search](../map-plugin-map-search/SKILL.md) | tool | 地图 POI/地址搜索与定位 |
| project-plot-plugin | [map-plugin-project-plot](../map-plugin-project-plot/SKILL.md) | tool | 工程标绘：工程范围正射瓦片加载、期数切换与显隐 |
| property-view-plugin | [map-plugin-property-view](../map-plugin-property-view/SKILL.md) | modify-panel | 属性查看：专题图选择 + 地图叠加专题图层（不含高清影像底图） |
| special-topic-layer-plugin | [map-plugin-special-topic-layer](../map-plugin-special-topic-layer/SKILL.md) | parallel-panel | 专题图层：专题目录树、勾选加载、透明度与批量设置 |
| view-project-plugin | [map-plugin-view-project](../map-plugin-view-project/SKILL.md) | modify-panel | 看项目：工具栏 + 右侧 Modify 壳（项目列表渐进接入） |

### 图层与展示

| 插件 | Skill | 类型 | 说明 |
|------|-------|------|------|
| event-heatmap-mvt-ol-plugin | [map-plugin-event-heatmap-mvt-ol](../map-plugin-event-heatmap-mvt-ol/SKILL.md) | display | 事件热力图 MVT 矢量瓦片图层（OpenLayers） |
| events-plugin | [map-plugin-events](../map-plugin-events/SKILL.md) | display | 事件点位展示与列表面板 |
| flight-data-plugin | [map-plugin-flight-data](../map-plugin-flight-data/SKILL.md) | display | 飞行数据右侧面板（OL/Cesium 双宿主） |
| high-speed-warning-plugin | [map-plugin-high-speed-warning](../map-plugin-high-speed-warning/SKILL.md) | display | 高速预警图层与面板（OL/Cesium 双宿主） |
| legend-plugin | [map-plugin-legend](../map-plugin-legend/SKILL.md) | display | 右下角图例面板，与专题图层勾选联动 |
| newpolicy-zone-plugin | [map-plugin-newpolicy-zone](../map-plugin-newpolicy-zone/SKILL.md) | display | 新政区域图层展示 |
| ortho-imagery-comparison-plugin | [map-plugin-ortho-imagery-comparison](../map-plugin-ortho-imagery-comparison/SKILL.md) | tool | 正射影像两期对比：工具互斥 + 双期卷帘/对比 UI |
| ortho-imagery-plugin | [map-plugin-ortho-imagery](../map-plugin-ortho-imagery/SKILL.md) | hybrid | 高清正射影像：期数下拉、TyLayer 瓦片、显隐与 switchPer |
| plugin-overlay-toggle-plugin | [map-plugin-plugin-overlay-toggle](../map-plugin-plugin-overlay-toggle/SKILL.md) | display | 目录标绘一键清除 |
| region-map-plugin | [map-plugin-region-map](../map-plugin-region-map/SKILL.md) | display | 行政区划边界地图图层 |
| road-map-plugin | [map-plugin-road-map](../map-plugin-road-map/SKILL.md) | display | 地名路网 WMTS 注记图层 |
| scenic-spots-plugin | [map-plugin-scenic-spots](../map-plugin-scenic-spots/SKILL.md) | display | 全景点位聚类展示与详情 |
| share-list-plugin | [map-plugin-share-list](../map-plugin-share-list/SKILL.md) | display | 地图分享列表 |
| video-monitor | [map-plugin-video-monitor](../map-plugin-video-monitor/SKILL.md) | display | 视频监控点位上图与播放 |

### 全景与影像

| 插件 | Skill | 类型 | 说明 |
|------|-------|------|------|
| panorama-multiple-plugin | [map-plugin-panorama-multiple](../map-plugin-panorama-multiple/SKILL.md) | tool | 多全景点位浏览与切换 |
| panorama-roam-plugin | [map-plugin-panorama-roam](../map-plugin-panorama-roam/SKILL.md) | display | 全景漫游模块（底图切换卡片内） |

### 三维工具

| 插件 | Skill | 类型 | 说明 |
|------|-------|------|------|
| scene-cesium-plugin | [map-plugin-scene-cesium](../map-plugin-scene-cesium/SKILL.md) | cesium-toolkit | Cesium 场景特效开关（雨/雪/雾等） |
| spatial-analysis-cesium-plugin | [map-plugin-spatial-analysis-cesium](../map-plugin-spatial-analysis-cesium/SKILL.md) | cesium-toolkit | Cesium 空间分析（可视域/通视） |
| spatial-measure-cesium-plugin | [map-plugin-spatial-measure-cesium](../map-plugin-spatial-measure-cesium/SKILL.md) | cesium-toolkit | Cesium 三维空间量测 |

### 行业工作台

| 插件 | Skill | 类型 | 说明 |
|------|-------|------|------|
| uav-plugins | [uav-workspace-react](../uav-workspace-react/SKILL.md) | — | uav-workspace-react |



## 完整列表

| 插件 | Skill | 类型 | 说明 |
|------|-------|------|------|
| base-map-switcher-cesium-plugin | [map-plugin-base-map-switcher-cesium](../map-plugin-base-map-switcher-cesium/SKILL.md) | map-chrome | Cesium 三维底图切换面板 |
| base-map-switcher-plugin | [map-plugin-base-map-switcher](../map-plugin-base-map-switcher/SKILL.md) | map-chrome | 右下角底图切换：正射/电子地图/全景漫游与区划路网复选 |
| base-map-vec-plugin | [map-plugin-base-map-vec](../map-plugin-base-map-vec/SKILL.md) | map-chrome | 电子地图与影像底图互斥切换 |
| brush-plugin | [map-plugin-brush](../map-plugin-brush/SKILL.md) | tool | 画笔：按住拖拽绘制自由路径 |
| comparison-plugin | [map-plugin-comparison](../map-plugin-comparison/SKILL.md) | tool | 卷帘/分屏地图对比（工具条 + 左侧参数抽屉） |
| compass-cesium-plugin | [map-plugin-compass-cesium](../map-plugin-compass-cesium/SKILL.md) | map-chrome | Cesium 三维指北针控件 |
| compass-plugin | [map-plugin-compass](../map-plugin-compass/SKILL.md) | map-chrome | 二维地图指北针/罗盘控件 |
| data-make-plugin | [map-plugin-data-make](../map-plugin-data-make/SKILL.md) | modify-panel | 全景制作：工具栏 + 右侧 Modify 壳（业务渐进接入） |
| demo-plugin | [map-plugin-demo](../map-plugin-demo/SKILL.md) | tool-template | 打点标绘开发模板（与 interest-point-plugin 同 t |
| do-analysis-plugin | [map-plugin-do-analysis](../map-plugin-do-analysis/SKILL.md) | modify-panel | 做分析：工具栏入口 + 右侧分析抽屉壳（不含 identify/出图业务 |
| draw-circle-plugin | [map-plugin-draw-circle](../map-plugin-draw-circle/SKILL.md) | tool | 画圆：圆心 + 圆上一点确定半径 |
| draw-ellipse-plugin | [map-plugin-draw-ellipse](../map-plugin-draw-ellipse/SKILL.md) | tool | 画椭圆：圆心 + 长轴 + 短轴三点 |
| draw-fanshape-plugin | [map-plugin-draw-fanshape](../map-plugin-draw-fanshape/SKILL.md) | tool | 画扇形：圆心 + 半径边 + 弧度边 |
| event-heatmap-mvt-ol-plugin | [map-plugin-event-heatmap-mvt-ol](../map-plugin-event-heatmap-mvt-ol/SKILL.md) | display | 事件热力图 MVT 矢量瓦片图层（OpenLayers） |
| events-plugin | [map-plugin-events](../map-plugin-events/SKILL.md) | display | 事件点位展示与列表面板 |
| favorites-plugin | [map-plugin-favorites](../map-plugin-favorites/SKILL.md) | modify-panel | 收藏夹：目录树、标绘预览、点击地图要素打开对应工具编辑 |
| flight-data-plugin | [map-plugin-flight-data](../map-plugin-flight-data/SKILL.md) | display | 飞行数据右侧面板（OL/Cesium 双宿主） |
| goto-report-plugin | [map-plugin-goto-report](../map-plugin-goto-report/SKILL.md) | modify-panel | 跳转报表/附件上传与详情 |
| high-speed-warning-plugin | [map-plugin-high-speed-warning](../map-plugin-high-speed-warning/SKILL.md) | display | 高速预警图层与面板（OL/Cesium 双宿主） |
| import-file-plugin | [map-plugin-import-file](../map-plugin-import-file/SKILL.md) | modify-panel | 导入矢量/文件到目录标绘层 |
| interest-point-plugin | [map-plugin-interest-point](../map-plugin-interest-point/SKILL.md) | tool | 兴趣点标绘：点击地图放置点要素，Panel 列表 + Modify 五  |
| legend-plugin | [map-plugin-legend](../map-plugin-legend/SKILL.md) | display | 右下角图例面板，与专题图层勾选联动 |
| locate-map-point-plugin | [map-plugin-locate-map-point](../map-plugin-locate-map-point/SKILL.md) | tool | 地图定点定位（输入坐标定位） |
| map-search-plugin | [map-plugin-map-search](../map-plugin-map-search/SKILL.md) | tool | 地图 POI/地址搜索与定位 |
| measure-angle-plugin | [map-plugin-measure-angle](../map-plugin-measure-angle/SKILL.md) | tool | 测夹角：顶点处显示两线段夹角（度） |
| measure-area-plugin | [map-plugin-measure-area](../map-plugin-measure-area/SKILL.md) | tool | 测面：多边形顶点、双击完成、显示地理面积 |
| measure-azimuth-angle-plugin | [map-plugin-measure-azimuth-angle](../map-plugin-measure-azimuth-angle/SKILL.md) | tool | 测方位角：夹角度数 + 东南西北方向 |
| measure-distance-plugin | [map-plugin-measure-distance](../map-plugin-measure-distance/SKILL.md) | tool | 测距：折线顶点、双击完成、显示地理距离 |
| newpolicy-zone-plugin | [map-plugin-newpolicy-zone](../map-plugin-newpolicy-zone/SKILL.md) | display | 新政区域图层展示 |
| ortho-imagery-comparison-plugin | [map-plugin-ortho-imagery-comparison](../map-plugin-ortho-imagery-comparison/SKILL.md) | tool | 正射影像两期对比：工具互斥 + 双期卷帘/对比 UI |
| ortho-imagery-plugin | [map-plugin-ortho-imagery](../map-plugin-ortho-imagery/SKILL.md) | hybrid | 高清正射影像：期数下拉、TyLayer 瓦片、显隐与 switchPer |
| panorama-multiple-plugin | [map-plugin-panorama-multiple](../map-plugin-panorama-multiple/SKILL.md) | tool | 多全景点位浏览与切换 |
| panorama-roam-plugin | [map-plugin-panorama-roam](../map-plugin-panorama-roam/SKILL.md) | display | 全景漫游模块（底图切换卡片内） |
| pick-map-point-plugin | [map-plugin-pick-map-point](../map-plugin-pick-map-point/SKILL.md) | tool | 地图选点拾取坐标 |
| plugin-overlay-toggle-plugin | [map-plugin-plugin-overlay-toggle](../map-plugin-plugin-overlay-toggle/SKILL.md) | display | 目录标绘一键清除 |
| project-plot-plugin | [map-plugin-project-plot](../map-plugin-project-plot/SKILL.md) | tool | 工程标绘：工程范围正射瓦片加载、期数切换与显隐 |
| property-view-plugin | [map-plugin-property-view](../map-plugin-property-view/SKILL.md) | modify-panel | 属性查看：专题图选择 + 地图叠加专题图层（不含高清影像底图） |
| region-map-plugin | [map-plugin-region-map](../map-plugin-region-map/SKILL.md) | display | 行政区划边界地图图层 |
| region-navigator-plugin | [map-plugin-region-navigator](../map-plugin-region-navigator/SKILL.md) | map-chrome | 行政区划导航：Popover 区划面板与围栏图层 |
| restore-map-view-extent-plugin | [map-plugin-restore-map-view-extent](../map-plugin-restore-map-view-extent/SKILL.md) | map-chrome | 恢复地图初始视图范围 |
| road-map-plugin | [map-plugin-road-map](../map-plugin-road-map/SKILL.md) | display | 地名路网 WMTS 注记图层 |
| scale-bar-plugin | [map-plugin-scale-bar](../map-plugin-scale-bar/SKILL.md) | map-chrome | 数字比例尺（1:N）控件 |
| scene-cesium-plugin | [map-plugin-scene-cesium](../map-plugin-scene-cesium/SKILL.md) | cesium-toolkit | Cesium 场景特效开关（雨/雪/雾等） |
| scenic-spots-plugin | [map-plugin-scenic-spots](../map-plugin-scenic-spots/SKILL.md) | display | 全景点位聚类展示与详情 |
| share-list-plugin | [map-plugin-share-list](../map-plugin-share-list/SKILL.md) | display | 地图分享列表 |
| spatial-analysis-cesium-plugin | [map-plugin-spatial-analysis-cesium](../map-plugin-spatial-analysis-cesium/SKILL.md) | cesium-toolkit | Cesium 空间分析（可视域/通视） |
| spatial-measure-cesium-plugin | [map-plugin-spatial-measure-cesium](../map-plugin-spatial-measure-cesium/SKILL.md) | cesium-toolkit | Cesium 三维空间量测 |
| special-topic-layer-plugin | [map-plugin-special-topic-layer](../map-plugin-special-topic-layer/SKILL.md) | parallel-panel | 专题图层：专题目录树、勾选加载、透明度与批量设置 |
| uav-plugins | [uav-workspace-react](../uav-workspace-react/SKILL.md) | — | uav-workspace-react |
| video-monitor | [map-plugin-video-monitor](../map-plugin-video-monitor/SKILL.md) | display | 视频监控点位上图与播放 |
| view-project-plugin | [map-plugin-view-project](../map-plugin-view-project/SKILL.md) | modify-panel | 看项目：工具栏 + 右侧 Modify 壳（项目列表渐进接入） |
| zoom-control-cesium-plugin | [map-plugin-zoom-control-cesium](../map-plugin-zoom-control-cesium/SKILL.md) | map-chrome | Cesium 三维缩放控件 |
| zoom-control-plugin | [map-plugin-zoom-control](../map-plugin-zoom-control/SKILL.md) | map-chrome | 二维缩放 +/- 控件 |

## 类型图例

| 类型 | 含义 |
|------|------|
| tool | Coordinator 互斥 |
| display | 展示图层 |
| map-chrome | 地图控件 |
| cesium-toolkit | Cesium 工具 |
| parallel-panel | 右栏不互斥 |
| modify-panel | Modify 互斥组 |
| hybrid | Entry 内 Core |

## 生成

`node scripts/generate-map-plugin-skills.mjs [--mode=portable|monorepo|both]`
