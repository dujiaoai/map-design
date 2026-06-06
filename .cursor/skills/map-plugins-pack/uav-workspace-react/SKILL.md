---
name: uav-workspace-react
description: >-
  React 机库地图工作台：列表/收藏/多路直播、地图图层桥接、双宿主。需 map-workspace-host-react 宿主契约。
  用于任意 React 项目实现机库面板与无人机地图联动。
---

# React 机库地图工作台（uav-plugins 对等实现）

> 宿主契约：[@map-workspace-host-react](../map-workspace-host-react/SKILL.md) · 插件索引：[@map-plugins-index](../map-plugins-index/SKILL.md)

## 权威来源（云眼 monorepo 对照，可选）

- **产品规格**：`packages-map/map-plugins/src/uav-plugins/REQUIREMENTS.md`
- **Vue 参考**：`packages-map/map-plugins/src/uav-plugins/`
- **详细契约**：本 skill 目录 [reference.md](reference.md)

---

## 产品边界（必须遵守）

| 规则 | 说明 |
|------|------|
| 不互斥 | 机库面板**不**参与绘制/测量 Coordinator；可与其它地图工具并行 |
| 右 420px | 主面板：Tab（机库列表 / 收藏夹 / 飞手实时*） |
| 左 40% | 多路直播独立抽屉，关闭时清空播放列表 |
| 列表 vs 地图点击 | 列表行 → **仅定位**；地图机库点 → 定位 + 可操作时 `addDevice` |
| 面板关闭 | 隐藏机库点/航线、关覆盖圈/禁飞区/气象/实时开关、清理非飞控实时机位 |
| 双宿主 | OpenLayers 二维 + Cesium 三维；图层/定位走宿主注入，插件不硬绑 map 引擎 |

\* 飞手 Tab 需权限；Vue 版当前为占位，React 可先留 Tab 壳。

---

## 推荐 React 架构

```
src/features/uav-workspace/
├── index.ts                    # 对外导出
├── UavWorkspaceProvider.tsx    # mapId + 宿主能力注入（对标 storeModules）
├── hooks/
│   ├── useUavWorkspace.ts      # 面板显隐、懒加载、onMount 自动展开
│   ├── useUavList.ts           # 列表拉取 + 3s 轮询
│   ├── useUavListFilter.ts     # 筛选 + 飞行置顶
│   ├── useUavFavorites.ts
│   ├── useMultiLive.ts
│   └── map/                    # 图层生命周期 hooks
│       ├── useDockLayer.ts
│       ├── useFlyingWaylineLayer.ts
│       └── useDroneRealtimeLayer.ts
├── lib/
│   ├── filterUavList.ts        # 纯函数，可从 Vue 版移植
│   ├── mapBridges.ts           # 覆盖圈/空域/气象/实时 开关注册表
│   ├── openUavDock.ts          # 定位 vs 开飞控
│   └── types.ts
├── components/
│   ├── UavToolbarEntry.tsx
│   ├── UavRightPanel.tsx       # Drawer 420px
│   ├── UavPanelHeader.tsx      # 标题 + 设置 Popover
│   ├── tabs/
│   │   ├── UavListTab.tsx
│   │   ├── UavCollectTab.tsx
│   │   └── FlyerRealtimeTab.tsx  # 占位可
│   ├── uav-list/
│   │   ├── SearchBar.tsx
│   │   ├── UavListItem.tsx
│   │   └── MultiLiveDrawer.tsx   # 左 40%
│   └── uav-set/
│       ├── CoverageToggle.tsx
│       ├── AirspaceToggle.tsx
│       └── WeatherToggle.tsx
└── context/
    └── uavVisibleContext.ts    # 按 mapId 共享 panelOpen
```

### Vue → React 映射

| Vue (uav-plugins) | React 对等 |
|-------------------|-----------|
| `useUavPlugin(deps, storeModules)` | `useUavWorkspace()` + `UavWorkspaceProvider` |
| `getUavPluginVisibleRef(mapId)` | `useUavPanelVisible(mapId)` 或 Zustand `panelOpenByMapId` |
| `createUavPluginLazyEntry` | `React.lazy(() => import('./UavRightPanel'))` + 首次 `show()` 再挂载 |
| `storeModules` 注入 | Context：`UavHostCapabilities`（见 reference.md） |
| `defineAsyncComponent(droneControl)` | `lazy()` + `Suspense` |
| `watch(visible)` 同步地图 | `useEffect(() => applyPanelMapOpen(open), [open])` |
| `onMounted` 自动 show | `useEffect` 读 `controlDevices` + `uavMapListPanelOpen` |
| `map/*MapBridge.ts` | 同名纯 TS 模块 + `registerXxxHandler(mapId, fn)` |
| `filterUavList.ts` | **直接移植**（无 Vue 依赖） |
| `ScrollLoadList` + `v-memo` | 虚拟列表（`@tanstack/react-virtual`）+ `React.memo` + 稳定 row key |

---

## 实现顺序（Checklist）

复制此清单跟踪进度：

```
Phase 1 — 壳与状态
- [ ] UavWorkspaceProvider + useUavWorkspace（show/setVisible/toggle/loading）
- [ ] 按 mapId 缓存 panelOpen；Entry 与 RightPanel 共享
- [ ] UavToolbarEntry + UavRightPanel（420px Drawer）
- [ ] 面板关闭时 applyUavListPanelMapOpen(false)

Phase 2 — 机库列表
- [ ] cloudviewmapUavInfoList → 写入全局 droneList store
- [ ] filterUavList 纯函数 + SearchBar 全部筛选项
- [ ] 飞行中置顶；无效坐标提示
- [ ] locateUavDock（列表点击仅 fit/flyTo）
- [ ] runningDock 轮询 ~3s；裸机 30s OSD 超时

Phase 3 — 地图图层（面板 visible 时）
- [ ] 机库点 / 固定翼 / 裸机（宿主 createOlDockInteraction 等）
- [ ] 飞行航线（在飞设备）
- [ ] 地图点击 → getDroneIconState → addDevice → ensureFlyingDroneRealtime
- [ ] 图层按 deviceSn 集合指纹增量更新，轮询只改 isFly 不重建整层

Phase 4 — 叠加与权限
- [ ] Header Popover：覆盖圈 5km / 禁飞区 WMS / 气象
- [ ] mapBridges + 宿主 setXxxVisible 注入
- [ ] hasPermission 门控各开关与 Tab

Phase 5 — 收藏与多路直播
- [ ] 列表星标 + 文件夹选择 Dialog
- [ ] 收藏夹 Tree CRUD + 批量移出
- [ ] MultiLive 4/6/9/16 + 拖拽 + 一键填充/清除
- [ ] lazy 加载 DroneVideo 播放器（宿主注入）

Phase 6 — 双宿主
- [ ] OL：view.fit + dock interaction
- [ ] Cesium：locateUavOnCesiumMap；进三维时 DroneShow 重建策略
```

---

## 核心 Hook 骨架

```tsx
// useUavWorkspace.ts — 行为对齐 useUavPlugin.ts
export function useUavWorkspace() {
  const { mapId, host } = useUavWorkspaceContext()
  const panelOpen = useUavPanelVisible(mapId)

  const show = useCallback(async () => {
    await ensureUavModuleLoaded()
    setPanelOpen(mapId, true)
    applyUavListPanelMapOpen(host, true)
    registerFlightRadiusHandler(mapId, host.setFlightRadiusVisible)
  }, [mapId, host])

  const setVisible = useCallback(async (open: boolean) => {
    if (!open) {
      applyUavListPanelMapOpen(host, false)
    }
    setPanelOpen(mapId, open)
    if (open) applyUavListPanelMapOpen(host, true)
  }, [mapId, host])

  useEffect(() => {
    const flight = host.useFlightControlStore.getState()
    if (flight.controlDevices?.length && flight.uavMapListPanelOpen !== false) {
      void show()
    } else if (flight.uavMapListPanelOpen === false) {
      applyUavListPanelMapOpen(host, false)
      host.clearDroneRealtimeOnMap?.()
    }
  }, []) // mount once

  return { panelOpen, show, setVisible, toggle: () => setVisible(!panelOpen) }
}
```

```tsx
// applyUavListPanelMapOpen — 对齐 syncUavListPanelMapState.ts
export function applyUavListPanelMapOpen(host: UavHostCapabilities, open: boolean) {
  host.useFlightControlStore.setState({ uavMapListPanelOpen: open })
  if (!open) {
    const sns = collectControlDeviceMapSns(host.useFlightControlStore.getState().controlDevices)
    host.clearDroneRealtimeOnMap?.(sns.length ? sns : undefined)
    host.setFlightRadiusVisible?.(false)
    host.setAirspaceVisible?.(false)
    host.setWeatherVisible?.(false)
    host.setDroneRealtimeVisible?.(false)
    host.setFlyerRealtimeVisible?.(false)
    queueMicrotask(() => host.clearDroneRealtimeOnMap?.(sns.length ? sns : undefined))
    if (!host.useFlightControlStore.getState().controlDevices?.length) {
      host.setDroneRealtimeOnMap?.(false)
    }
  }
}
```

---

## UI 库建议（任选，保持布局尺寸）

| 区域 | 建议组件 |
|------|----------|
| 右/左 Drawer | Ant Design `Drawer` / Radix Sheet / MUI Drawer |
| Tab | Ant Design `Tabs` lazy |
| 列表 | 虚拟滚动 + `Empty` |
| 筛选 | `Input` + `Checkbox` + 级联 `Cascader` |
| 收藏树 | `Tree` + 编辑模式 checkbox |
| 多路直播 | CSS Grid + HTML5 drag-and-drop |
| 权限 | 读 `@taiyi/permission` 或宿主 permission hook |

**固定尺寸**：右 420px、左 40%、设置 Popover 400px。

---

## 状态管理建议

| 数据 | 推荐 |
|------|------|
| 全量机库列表 | Zustand `droneInteractiveStore` 或 React Query + 全局 cache |
| 飞控设备 | Zustand `flightControlStore`（含 `controlDevices`、`uavMapListPanelOpen`） |
| 面板显隐 | Context 或 Zustand `panelOpenByMapId[mapId]` |
| 筛选 params | `useState` 在 UavListTab 内 |
| 多路直播 slots | `useMultiLive` 本地 state；关闭 drawer 清空 |
| 地图桥接开关 | 模块级 `Map`（同 Vue `flightRadiusMapBridge.ts`） |

---

## 测试要点（与 Vue 行为对齐）

1. 列表点击：地图移动，**不**调用 `addDevice`
2. 地图点点击：不可操作时 toast，不重复加设备
3. 关面板：叠加层全关；飞控仍有设备时保留其模型
4. 筛选：`coverageArea` **不过滤**列表；`areaCode` 前缀匹配
5. 多路直播：同 deviceSn 不可占两格；关 drawer 清空
6. 权限缺失：对应 UI 不渲染（非 disabled）
7. 3s 轮询：`isFly` 变更加入/移除航线，不闪烁重建机库点层

---

## 不要做的事

- 不要让机库面板与「做分析/属性查看」共用一个互斥组（除非产品明确要求）
- 不要在插件内写死 WMS/覆盖圈渲染——走宿主 `setXxxVisible`
- 不要在列表点击里直接打开飞控
- 不要用轮询全量替换列表引用导致整表重渲染（用 fingerprint + memo）
- 不要跨 feature 直接 import 其它地图插件源码

---

## 附加资源

- [reference.md](reference.md) — API、类型、筛选规则、权限常量、宿主接口、常量枚举
- Vue 源码对照：`packages-map/map-plugins/src/uav-plugins/`
