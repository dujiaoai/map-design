---
name: cloud-uav-esm-plugin
description: >-
  Develop YunYan Cloud UAV remote ESM modules in cloud/uav: mount/unmount,
  registry, Vite multi-entry build, and Vue host integration. Use when editing
  cloud/uav, module-manifest, dock-dashboard, or remote plugin assets—not for
  saas-web map-plugin-bridge (see map-plugin-integration).
metadata:
  author: map-design
  version: "1.0.0"
compatibility: Requires cloud/uav (@repo/cloud-uav), Vue yunyan-web host for integration tests.
---

# Cloud UAV ESM Remote Plugin

## 先读文档

| 主题 | 文档 |
| --- | --- |
| 完整 README | [cloud/uav/README.md](../../cloud/uav/README.md) |
| ADR | [docs/adr/0006-esm-remote-plugin-over-mf.md](../../docs/adr/0006-esm-remote-plugin-over-mf.md) |
| Map Tool 插件（不同体系） | [../map-plugin-integration/SKILL.md](../map-plugin-integration/SKILL.md) |

## 与 saas-web Map Plugin 的区别

| 维度 | Map Tool Plugin | Cloud UAV |
| --- | --- | --- |
| 宿主 | saas-web React | yunyan-web Vue |
| 加载 | map-plugin-bridge | 动态 `import()` ESM |
| 地图 | 共享 MapProvider（待接） | 插件自有 UI |
| 路径 | `features/map-workspace` | `cloud/uav` |

## 公共 API

```ts
interface CloudPluginUavModule {
  mount(container: string | HTMLElement): Promise<void>
  unmount(container: HTMLElement): Promise<void>
  reload?(container: HTMLElement): Promise<void>  // dev
}
```

宿主流程：`import registry.js` → `loadModule(moduleId)` → `mount` → 离开路由前 `unmount`。

## 目录与 manifest

| 项 | 路径 |
| --- | --- |
| 包根 | `cloud/uav/` |
| 模块清单 | `src/shared/config/module-manifest.ts` |
| Registry 构建入口 | `src/modules/registry/` |
| 示例模块 | `src/modules/dock-dashboard/` |
| FSD 切片 | `src/{app,modules,features,entities,widgets,shared}/` |

新增模块：manifest 加项 + 新建 `src/modules/<id>/` + registry 注册。

## 构建要点（vite.config.ts）

- **ESM 多入口**：`assets/registry.js` + `assets/{moduleId}.js`
- **Base**：`/yunyan-cloud-uav/`
- **`esbuild.jsx: 'automatic'`** — 不用 `@vitejs/plugin-react`（宿主无 Refresh preamble）
- **`@repo/ui` alias** → `packages/ui` 源码
- 挂载根 class：`.yunyan-cloud-uav`（Tailwind 自包含）

## UI 组件

```bash
pnpm --filter @repo/ui ui:add button drawer
```

```tsx
import { Button, Drawer, DrawerCloseButton } from '@repo/ui'
```

| 推荐 | 避免 |
| --- | --- |
| `<DrawerCloseButton variant="outline">` | `<DrawerClose asChild><Button /></DrawerClose>` |
| Drawer 默认 autoFocus（微前端焦点） | 嵌套 `<button>` |

详见 Skill `repo-ui-package`。

## 宿主集成（yunyan-web）

```ts
import { loadCloudPluginUavModule } from '@/shared/cloud-plugin-uav/loadCloudPluginUav'

const plugin = await loadCloudPluginUavModule('dock-dashboard')
await plugin.mount(containerEl)
// onBeforeUnmount:
await plugin.unmount(containerEl)
```

- 同一容器重复挂载前先 `unmount`
- 传 `HTMLElement`，非选择器字符串（若 wrapper 支持两者，以 README 为准）
- CSP / 静态路径：`/yunyan-cloud-uav/assets/*`

## 本地开发

```bash
pnpm --filter @repo/cloud-uav dev
```

Dev 插件：`vite-plugin-dev-stub-client`、`dev-remote-entry`、`dev-reload`（SSE 热更新 remount）。

## 禁止

- 在 cloud/uav 使用 map-plugin-bridge 或 workspace-store
- 引入 `@vitejs/plugin-react` 到生产构建
- 依赖 saas-web 路由或 `@repo/ruoyi-api`（插件自管 API / Cookie）
- 与 Map Tool Plugin 文档混写接入步骤

## 验证

```bash
pnpm --filter @repo/cloud-uav build
pnpm --filter @repo/saas check
```
