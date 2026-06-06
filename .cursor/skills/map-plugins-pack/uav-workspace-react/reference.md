# uav-workspace-react — 详细参考

> 产品叙述见 `packages-map/map-plugins/src/uav-plugins/REQUIREMENTS.md`。本文档供 React 实现时查阅契约与算法。

---

## 1. 宿主能力接口（对标 storeModules）

React Context 建议命名为 `UavHostCapabilities`：

```ts
export interface UavListRow {
  deviceSn: string
  deviceName: string
  deviceLongitude?: number
  deviceLatitude?: number
  parentSn?: string
  droneVersion?: string
  dockStatus?: number
  networkQuality?: number
  airspaceType?: number
  areaCode?: string
  isFly?: boolean
  noDock?: boolean
  flightId?: string
  waylineName?: string
  Control?: number
  Scan?: number
  level?: string
  opTypes?: string | string[]
}

export interface UavHostCapabilities {
  // Stores
  useDroneInteractiveStore: {
    getState: () => { allDroneList: UavListRow[]; setAllDroneList: (l: UavListRow[]) => void }
  }
  useFlightControlStore: {
    getState: () => {
      controlDevices: Array<{ deviceSn: string; parentSn?: string }>
      uavMapListPanelOpen?: boolean
      addDevice?: (device: Record<string, unknown>) => Promise<void>
      cloudApiWebsocket?: { sendMessage: (msg: { messageType: string; sn: string }) => void }
    }
    setState: (partial: Partial<{ uavMapListPanelOpen: boolean }>) => void
  }

  // Map layers (OL / Cesium 由宿主实现)
  createOlDockInteraction?: (opts: { mapApi: unknown; onDockClick: (uav: unknown) => void }) => DockLayerApi
  createCzmDockInteraction?: (opts: { onDockClick: (uav: unknown) => void }) => DockLayerApi
  createOlFixedWingInteraction?: (opts: object) => DockLayerApi
  createCzmFixedWingInteraction?: (opts: object) => DockLayerApi
  createOlWaylineLoader?: (opts: object) => WaylineLoaderApi
  createCzmWaylineLoader?: (opts: object) => WaylineLoaderApi
  locateUavOnCesiumMap?: (uav: UavListRow) => void

  // Overlay toggles (宿主渲染图层)
  setFlightRadiusVisible?: (visible: boolean) => boolean | void | Promise<boolean | void>
  getFlightRadiusVisible?: () => boolean
  setAirspaceVisible?: (visible: boolean) => boolean | void | Promise<boolean | void>
  getAirspaceVisible?: () => boolean
  setWeatherVisible?: (visible: boolean) => boolean | void | Promise<boolean | void>
  getWeatherVisible?: () => boolean
  setDroneRealtimeVisible?: (visible: boolean) => boolean | void | Promise<boolean | void>
  getDroneRealtimeVisible?: () => boolean
  setFlyerRealtimeVisible?: (visible: boolean) => boolean | void | Promise<boolean | void>
  getFlyerRealtimeVisible?: () => boolean

  // Flight control UI (lazy)
  droneControlComponent?: () => Promise<{ default: React.ComponentType<{ deps: unknown }> }>
  droneVideoComponent?: () => Promise<{ default: React.ComponentType<unknown> }>

  getDroneIconState?: (opts: { version: string; Control: number; Scan: number }) => { clickable: boolean }
  ensureFlyingDroneRealtime?: (drone: Pick<UavListRow, "deviceSn" | "parentSn">) => void
  clearDroneRealtimeOnMap?: (deviceSns?: string[]) => void
  setDroneRealtimeOnMap?: (enabled: boolean) => void
  clearOlMapWaylines?: (map: unknown) => void
  mitt?: { on: Function; off: Function; emit?: Function }
  modeCodeDisconnected?: number
  getIsSuperUser?: () => boolean
}

interface DockLayerApi {
  loadDockPoints: (uavs: unknown[]) => void
  setDockPointVisible: (visible: boolean) => void
  destroy: () => void
}

interface WaylineLoaderApi {
  createWayLine: (waylineId: string, device: Record<string, unknown>) => Promise<boolean>
  destroy: () => void
}
```

---

## 2. API

| 用途 | 方法 | 说明 |
|------|------|------|
| 机库列表 | `cloudviewmapUavInfoList({ _t: Date.now() })` | `@yysl/request` |
| 收藏更新 | `uavFavoritesUpdate({ id, droneSnList, nodeName })` | 追加 deviceSn |
| 取消收藏 | `uavFavoritesCancel(deviceSn)` | |
| 行政区 | `regionInfoApi` 懒加载 | 见 Vue `regionCascaderLazyLoad.ts` |
| 执飞轮询 | running dock 接口 | 3s 间隔，见 `runningDockPollCoordinator.ts` |

列表拉取后**必须**写入 `allDroneList`，供覆盖圈、多路直播等不依赖面板挂载的场景使用。

---

## 3. 筛选参数 UavListSearchParams

```ts
export interface UavListSearchParams {
  deviceName: string
  flyding: boolean      // 默认 true
  wait: boolean         // 默认 true
  nodeLevels: string[]  // '1'|'2'|'3'
  uavTypes: string[]    // '1'..'5'
  dockStatuses: string[]
  networkQualities: string[]
  airspaceTypes: string[]
  operationTypes: string[]
  coverageArea: string[]  // 不参与列表过滤
  areaCodes: (string | number)[]
}
```

### 过滤规则摘要

- `deviceName`：子串匹配
- `areaCodes`：取末级 code，去掉尾 `-`，`areaCode.startsWith(prefix)`
- `flyding` / `wait`：两者都选则不过滤飞行态；仅选一时按 `isFly` 过滤
- 各多选：全选等于不过滤；部分选时才过滤
- `coverageArea`：**忽略**（与 urcop 一致）
- 结果：`sortUavListFlyFirst` — `isFly=true` 置顶

**可直接复制** Vue 文件：`uav-plugins/widgets/uavList/filterUavList.ts`

---

## 4. 常量（libs/constant.ts）

| 枚举 | 值 |
|------|-----|
| 覆盖范围选项 | 3KM / 4KM / 5KM |
| 节点层级 | 一级 / 二级 / 三级 |
| 无人机类型 | 一代 / 二代 / 三代 / 固定翼 / 裸机 |
| 机库状态 dockStatus | 0 待命 / 1 离线 / 2 维护 / 3 管制 |
| 网络质量 | 0 优 / 1 中 / 2 差 |
| 空域类型 | 0 禁飞 / 1 限飞 / 2 敏感 / 3 适飞 |
| 覆盖圈半径 | **5 km**（`FLIGHT_RADIUS_KM`） |

### 列表行标签逻辑

- `isFly` → 「飞行中」
- 否则按 `dockStatus` → 待命 / 离线 / 维护 / 管制
- 节点层级：`droneVersion` 映射（一代/二代/三代→二级，裸机→三级，固定翼→一级）

---

## 5. 权限常量

| 功能 | 常量 |
|------|------|
| 机库覆盖范围 | `YUNKAN_MAP_DOCK_COVERAGE` |
| 低空禁飞区 | `YUNKAN_MAP_LOW_ALTITUDE_NOFLY` |
| 气象数据 | `YUNKAN_MAP_WEATHER_DATA` |
| 无人机实时数据 | `YUNKAN_MAP_DRONE_REALTIME` |
| 飞手实时 Tab | `YUNKAN_MAP_FLYER_REALTIME` |

来源：`@taiyi/permission/constant/map`

---

## 6. 地图桥接（map/*MapBridge.ts）

插件侧只维护 **按 mapId 的开关状态 + handler 注册表**；图层由宿主实现。

| 桥接 | 宿主 handler | 参数参考 |
|------|--------------|----------|
| `flightRadiusMapBridge` | `setFlightRadiusVisible` | 5km 圆 |
| `airspaceMapBridge` | `setAirspaceVisible` | WMS `hz_XZQM:test_geo_airspace_pg`，CQL `spaceType IN ('0','1')` |
| `weatherMapBridge` | `setWeatherVisible` | zIndex 500 |
| `realtimeMapBridge` | `setDroneRealtimeVisible` / `setFlyerRealtimeVisible` | drone 开关二维三维**共用** |

注册时机：`useUavWorkspace.show()` 成功后 `registerFlightRadiusHandler(mapId, handler)`。

---

## 7. 用户流程（实现时必须区分）

### locateUavDockAction（列表 / 收藏树点击）

1. 校验经纬度非 0
2. OL：`view.fit(point, { duration: 1000, maxZoom: 15, padding: [100,100,100,100] })`
3. Cesium：`locateUavOnCesiumMap(uav)`
4. **不**调用 `addDevice`

### openUavDockAction（地图机库点点击）

1. 同上定位
2. `getDroneIconState({ version, Control, Scan })` → `clickable`
3. 不可点击 → warning toast
4. `addDevice(toFlightControlDevice(uav))`
5. `ensureFlyingDroneRealtime(uav)`

---

## 8. 多路直播

```ts
type MultiLiveGridMode = 4 | 6 | 9 | 16

interface MultiLiveSlotItem {
  deviceSn: string
  deviceName: string
  // ... 播放器所需字段
}
```

- Context 提供：`panelOpen`、`draggingDevice`、`setDraggingDevice`
- 列表行在 `panelOpen` 时 `draggable`
- `assignSlot(index, item)`：同 deviceSn 拒绝并提示
- `createPlayVideoList`：按当前 filtered 列表顺序填充空槽
- 关闭 drawer：`clearPlayList()` + reset drag state

---

## 9. 收藏夹树

- 节点类型：`dir` | `uav`
- node-key：`uav:{folderId}:{deviceSn}` 等（见 `uavCollectTree.ts`）
- 编辑模式：checkbox + 全选机库 + 批量移出
- 操作：新建根/子文件夹、重命名、删除文件夹、移出单个机库

---

## 10. 性能约定

| 场景 | 策略 |
|------|------|
| 长列表 | 虚拟滚动 + 分页展示 |
| 轮询更新 | row render key: `[deviceSn, isFly, dockStatus, deviceName, droneVersion, level, favorited]` |
| 机库图层 | `getUavListDeviceIdentity(list)` 指纹变化才 `loadDockPoints` |
| 懒加载 | 右面板、设置 Popover、Tab 内容、飞控/视频组件均 lazy |
| mapId 隔离 | 面板显隐、descriptor 按 mapId 缓存；drone 实时开关全局共用 |

---

## 11. Vue 源文件对照表

| 能力 | Vue 路径 |
|------|----------|
| 主 hook | `hooks/useUavPlugin.ts` |
| 面板关闭清理 | `widgets/uavList/syncUavListPanelMapState.ts` |
| 列表主界面 | `widgets/uavList/Main.vue` |
| 筛选 UI | `widgets/uavList/SearchCard.vue` |
| 过滤逻辑 | `widgets/uavList/filterUavList.ts` |
| 开飞控 | `widgets/uavList/openUavDock.ts` |
| 机库图层 | `widgets/uavList/useUavListDockLayer.ts` |
| 多路直播 | `widgets/uavList/MultiLive.vue` |
| 收藏 | `widgets/uavCollect/Main.vue` |
| 设置 | `widgets/uavSet/Main.vue` |
| Tab 容器 | `features/UavPluginModifyCommon.vue` |
