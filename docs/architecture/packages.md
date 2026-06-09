# 共享 Packages

四个 workspace 包供 App 与 cloud 模块复用。各包经 `index.ts` 导出 Public API，内部实现不对外暴露。

## 总览

| 包 | 依赖 | 消费方 |
| --- | --- | --- |
| `@repo/ui` | React 19、Base UI、Tailwind | saas-web、cloud-uav |
| `@repo/auth` | zod、zustand | saas-web（admin 规划） |
| `@repo/api-client` | 无 runtime 依赖 | saas-web（规划主用） |
| `@repo/ruoyi-api` | zod | saas-web（当前主用） |

## @repo/ui

**路径**：`packages/ui`

shadcn/ui + Base UI 组件库，含 SaaS 侧栏导航复合组件。

**选型原则**：实现功能 UI 时 **优先 shadcn** — 先查 `@repo/ui` 是否已导出；没有则 `pnpm --filter @repo/ui ui:add <component>` 添加到本包，再在 App 中 `import { … } from '@repo/ui'`。勿在 app 内重复造 Button/Dialog 等基础件。

### 导出

| 入口 | 内容 |
| --- | --- |
| `@repo/ui` | Button、Drawer、Sidebar、Avatar、Tabs 等 |
| `@repo/ui/styles/globals.css` | Tailwind 全局样式 |

### 复合组件

| 组件 | 用途 |
| --- | --- |
| `AppSidebar` | 侧栏容器 |
| `NavMain` | 可折叠导航菜单 |
| `NavUser` | 用户菜单 |
| `NavNotifications` | 通知入口 |
| `TeamSwitcher` | 租户切换（C-11：`GET /v1/tenants` + 重新登录） |

### Vite 消费约定

App 通过 alias 指向源码（非构建产物）：

```ts
{ find: '@repo/ui', replacement: path.resolve(__dirname, '../../packages/ui') }
```

`app.css` 引入 globals 并 `@source` UI 组件以支持 Tailwind 扫描。

## @repo/auth

**路径**：`packages/auth`

Session 管理、Token 存储、RBAC 守卫、React Context。

### 核心 API

| 导出 | 说明 |
| --- | --- |
| `createAuth(options)` | 创建 auth 实例（storageKeyPrefix 等） |
| `auth.setSession()` / `getSession()` | Session CRUD |
| `auth.requireAuthenticated(redirect)` | clientLoader 守卫 |
| `requireRole()` / `hasRole()` | RBAC 检查 |
| `SessionProvider` / `useSession()` | React Context |
| `TenantProvider` / `useTenant()` | 租户 Context |
| `SaaSRole` | 角色枚举（PlatformAdmin 等） |

### Web 实例化

`apps/web/shared/auth/instance.ts`：

```ts
export const auth = createAuth({ storageKeyPrefix: 'saas-web' })
```

Session 结构（Zod）：

```ts
{ user: SessionUser, tenant: SessionTenant | null, roles: SaaSRole[] }
```

## @repo/api-client

**路径**：`packages/api-client`

通用 REST HTTP 客户端，面向未来 SaaS `/v1` API。

### 核心 API

| 导出 | 说明 |
| --- | --- |
| `createApiClient(options)` | 创建客户端 |
| `ApiError` | HTTP 错误（status、body） |

### 能力

- `Authorization: Bearer` 自动注入
- 401 → 调用 `authHandlers.refresh()` → 重试一次
- JSON 请求/响应解析

### 测试

`src/client.test.ts` 覆盖 refresh 重试与错误路径。

## @repo/ruoyi-api

**路径**：`packages/ruoyi-api`

RuoYi 后端 API 封装，响应用 Zod 校验。

### 核心 API

| 导出 | 说明 |
| --- | --- |
| `createRuoYiClient(options)` | 创建客户端（baseUrl、getToken） |
| `RuoYiApiError` | code !== 200 时抛出 |
| `getCodeImg()` / `login()` | 验证码 + 登录 |
| ~~`getUserInfo()` / `getMenuRouters()` / `login()` 等~~ | **Sprint C saas-web 下线** → `@repo/api-client` + mock-nav |
| ~~`getUserProfile()` / `updateUserProfile()` / `updateUserPassword()`~~ | **Sprint C 下线** → `/v1/users/me*` |
| `menuRouteSchema` / `userInfoSchema` 等 | Zod schemas + 类型 |

### 与 api-client 的边界

| 维度 | ruoyi-api | api-client |
| --- | --- | --- |
| 协议 | RuoYi envelope `{ code, msg, data }` | 标准 REST + HTTP status |
| 校验 | Zod schema per endpoint | 调用方自行解析 |
| saas-web 会话 | api-client（C-06～C-12 ✅） | 登录、注册、bootstrap、Account、TeamSwitcher、无 RuoYi 桥接 |
| admin / 权限 | Sprint D → api-client | `/v1/admin/*`、权限码 |
| 业务 API | Sprint E | 地图、机库等 |
| 阶段 | 迁移前 RuoYi | C/D 后 saas-web + admin 主用 api-client |
| Token | 手动 getToken 注入 | authHandlers 自动管理 |

## 新增 Package 指南

1. 在 `packages/<name>/` 创建，包名 `@repo/<name>`
2. `package.json` 设置 `"exports": { ".": "./index.ts" }`
3. 仅通过 `index.ts` 导出 Public API
4. 在 `pnpm-workspace.yaml` 的 `packages` 中已覆盖 `packages/*`，无需额外配置
5. 更新本文档与 [monorepo.md](./monorepo.md) 依赖图
