# video-monitor — 契约参考

## 概述

视频监控点位上图与播放

| 属性 | 值 |
|------|-----|
| 类型 | display |
| toolId | — |
| 常量名 | — |
| Coordinator | 无 |
| lazyEntry | 无/轻量 Entry |
| 双宿主 | 否 |

## 集成模式

1. 宿主挂载 Entry
2. 首次交互 new Core(caps)
3. 卸载 destroy 图层

## 产品规格摘要

getStVideoMonitoringData 拉取点位 → VectorLayer 图标（EPSG:4547，decryptApiData）→ 点击 VideoDialog 播放。

## 宿主依赖明细

| 能力 | 用途 | 云眼默认 |
|------|------|----------|
| `decryptApiData` | 接口解密 | 云眼 decrypt 工具 |
| `permissions.can` | 视频监控门控 | FunctionCard |

## 互斥与协作



## 延伸阅读

- [map-workspace-host-react](../map-workspace-host-react/SKILL.md)
- [map-plugins-index](../map-plugins-index/SKILL.md)
