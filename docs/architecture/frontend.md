# 前端工程规范

## 技术栈

| 类别 | 选型 |
| --- | --- |
| UI | React 19、TypeScript |
| 路由 | React Router 7.16 Framework |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS v4 |
| 组件 | `@repo/ui`（`packages/ui`） |

不含 i18n，UI 固定中文。

## 目录（FSD 简化）

```
app/
├── routes.ts              # 路由配置
├── root.tsx               # 根组件
├── layouts/               # auth-layout、app-layout（含 clientLoader 守卫）
├── routes/                # 页面（login、home）
├── providers/             # AppProviders
├── features/              # 用户场景（map-workspace、account 等）
├── entities/              # 领域实体（navigation、menu、ruoyi-user 等）
├── shared/                # 横切（auth、api、session、queries、config）
└── widgets/               # 复合 UI（app-sidebar、map-dock-panel 等）
```

与标准 FSD 的差异：

- 无独立 `pages/` 层，路由页放在 `routes/`
- `layouts/` 独立，承载 `clientLoader` 鉴权守卫

依赖方向：`widgets → features → entities → shared`，低层不得引用高层。

## apps/web 切片索引

| 层 | 主要切片 | 职责 |
| --- | --- | --- |
| **entities** | navigation, menu, ruoyi-user, notification | 导航模型、RuoYi 用户、通知 |
| **features** | map-workspace, account, notifications, dashboard | 工作台状态机、账号、通知 |
| **widgets** | app-sidebar, map-canvas, map-tool-host, map-dock-panel, map-import-drawer, dock-panel, account-sheet, notification-sheet | UI 装配 |
| **shared** | auth, api, session, queries, config, lib, ui | 横切能力 |

## 横切能力

| 能力 | 选型 |
| --- | --- |
| 路由守卫 | `clientLoader` + `auth.requireAuthenticated(redirect)` |
| 状态 | Zustand（UI 状态）+ TanStack Query（服务端数据） |
| 表单 | React Hook Form + Zod |
| Lint / Format | Biome（`biome.json`，覆盖 apps/packages/cloud） |
| 测试 | Vitest + RTL（Playwright E2E 规划中） |
| 错误 | ErrorBoundary + Sentry（规划） |

## Vite 配置约定

```ts
const repoRoot = path.resolve(__dirname, '../..')
const uiDir = path.resolve(__dirname, '../../packages/ui')
```

`app/app.css`：

```css
@import "../../../packages/ui/src/styles/globals.css";
@source "../../../packages/ui/src/**/*.{ts,tsx}";
```

## SPA 模式

Web / Admin 使用 `react-router.config.ts` 中 `ssr: false`，产出 `build/client/`。

## 地图工作台（saas-web）

租户工作台首页为地图 + 侧栏导航。菜单项打开的 UI 分 Collapsible、Dock 列、地图浮层、L4 右侧条带、Vaul Drawer 等类型，**不要混用两种 Drawer 实现**。

- UI 载体规范：[map-workspace-ui.md](./map-workspace-ui.md)
- 插件桥接：[map-plugin-integration.md](./map-plugin-integration.md)

## 相关文档

- [packages.md](./packages.md) — 共享包 API
- [backend-integration.md](./backend-integration.md) — 数据流
- [../CONTRIBUTING.md](../CONTRIBUTING.md) — 新增 Feature 流程
