---
name: map-plugin-video-monitor
description: >-
  React 地图「视频监控点位上图与播放」能力（类型 display）。需 MapHostProvider 宿主注入；实现前读 map-workspace-host-react。
---

# React：视频监控点位上图与播放

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md)

**插件类型**：`display`

---

## 1. 产品契约

### 定位

视频监控点位上图与播放

### 边界规则

| 不互斥 | 通常不接入 Coordinator |
| 无绘制态 | 图层显隐 + 数据加载 + 点击交互 |
| 可并行 | 可与测量/绘制工具同时开启 |

### 功能要点

- getStVideoMonitoringData 拉取点位
- VectorLayer 点位图标；点击打开 VideoDialog
- 解密 decryptApiData；坐标系 EPSG:4547
- FunctionCard「视频监控」

### 行为详述

getStVideoMonitoringData 拉取点位 → VectorLayer 图标（EPSG:4547，decryptApiData）→ 点击 VideoDialog 播放。

### React 架构建议

src/features/video-monitor/ — core 图层 + VideoDialog；宿主提供 decrypt API

---

## 2. React 实现指南

### React 实现映射

| 概念 | React |
|------|-------|
| `useVideoMonitor(caps)` | `useVideoMonitor()` + MapHostProvider |
| visibleRef 按 mapId | Context / Zustand |

### 推荐目录

```
src/features/video-monitor/
├── hooks/useVideoMonitor.ts
├── components/VideoMonitorEntry.tsx
├── core/
└── index.ts
```

### Checklist

- [ ] useVideoMonitor：show/toggle/setVisible/destroy
- [ ] Entry 挂载到宿主工具栏或控件区
- [ ] 图层 create/destroy 与 mapId 生命周期绑定
- [ ] 无 Modify 则仅 Entry + core

---

## 3. 宿主依赖

| 能力 | 用途 | 云眼默认（可替换） |
|------|------|-------------------|
| `decryptApiData` | 接口解密 | 云眼 decrypt 工具 |
| `permissions.can` | 视频监控门控 | FunctionCard |

---

## 4. 插件协作

- **toolId**：无（展示/控件类可能不参与 Coordinator）



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
