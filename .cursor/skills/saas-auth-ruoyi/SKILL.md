---
name: saas-auth-ruoyi
description: >-
  RuoYi login, session guards, bootstrap, TanStack Query, and RBAC for saas-web.
  Use when adding protected routes, login/logout, user menu bootstrap, profile
  mutations, tenant session sync, or choosing ruoyi-api vs api-client—even if
  the user only says "add auth", "fix redirect loop", or "wire getInfo".
metadata:
  author: map-design
  version: "1.0.0"
compatibility: Requires map-design apps/web, @repo/auth, @repo/ruoyi-api.
---

# SaaS Auth（RuoYi 过渡阶段）

## 先读文档

| 主题 | 文档 |
| --- | --- |
| 认证与 RBAC | [docs/architecture/auth-rbac.md](../../docs/architecture/auth-rbac.md) |
| 后端集成 | [docs/architecture/backend-integration.md](../../docs/architecture/backend-integration.md) |
| `@repo/auth` API | [docs/architecture/packages.md](../../docs/architecture/packages.md#repoauth) |
| ADR | [docs/adr/0005-ruoyi-transitional-backend.md](../../docs/adr/0005-ruoyi-transitional-backend.md) |

## API 选用（当前）

| 场景 | 包 | 禁止 |
| --- | --- | --- |
| 登录、验证码、getInfo、菜单、profile | `@repo/ruoyi-api` | UI 层直接 `fetch` RuoYi |
| 未来 SaaS `/v1` 业务 | `@repo/api-client`（后端未就绪） | 用 api-client 替换登录链路 |
| App 数据访问 | `shared/queries/*` + TanStack Query | feature/widget 直接 new client |

RuoYi 响应 envelope：`{ code, msg, data }`；`code !== 200` → `RuoYiApiError`。

## 登录 → 工作台链路

```
routes/login.tsx
  → ruoyi-api: getCodeImg + login(RSA password)
  → auth.setSession(token, user stub)
  → navigate /

layouts/app-layout.tsx clientLoader
  → auth.requireAuthenticated(redirect)
  → bootstrapAuthenticatedApp()
  → userInfo + menuRouters queries
  → ruoyi-profile-store + sync auth session
  → 失败 → clearAppSession → redirect /login
```

### Mock 开发

`shared/mock/dev-auth.ts`：`MOCK_ACCESS_TOKEN` 跳过 RuoYi 请求，bootstrap 用 mock userInfo。本地 Playwright / 无后端时走此路径。

## 关键模块

| 职责 | 路径 |
| --- | --- |
| Auth 实例 | `apps/web/app/shared/auth/instance.ts` |
| 统一导出 | `apps/web/app/shared/auth/client.ts` |
| Bootstrap | `apps/web/app/shared/session/bootstrap-authenticated-app.ts` |
| 登出清理 | `apps/web/app/shared/session/clear-app-session.ts` |
| 租户切换 | `apps/web/app/shared/session/tenant-session-sync.tsx` |
| RuoYi client | `apps/web/app/shared/queries/ruoyi-client.ts` |
| User / menu queries | `shared/queries/user-queries.ts`、`menu-queries.ts` |
| Profile store | `entities/ruoyi-user/model/ruoyi-profile-store.ts` |
| 权限转换 | `entities/ruoyi-user/lib/permissions.ts` |
| 登录页 | `apps/web/app/routes/login.tsx` |
| 守卫 layout | `apps/web/app/layouts/app-layout.tsx` |

## 新增受保护路由 checklist

1. 在 `app/routes.ts` 注册，挂到 `app-layout` 子路由
2. **不要**重复写 token 检查 — 依赖 `clientLoader` 已有 `requireAuthenticated`
3. 需角色：layout 或 route 级 `requireRole()` / `hasRole()`（UX 隐藏，**服务端为准**）
4. 新 RuoYi 数据：在 `shared/queries/` 加 query options，经 `@repo/ruoyi-api`
5. 401/403：确保走 `clearAppSession()`，勿只清 localStorage 一半

## 账号 / Profile 变更

- 读：`getUserProfile` query
- 写：`features/account` mutations → ruoyi-api update  endpoints
- 改密码：独立 mutation + 表单 Zod schema（`account-schemas.ts`）

## 租户（当前）

- `TenantProvider` / `useTenant()` 来自 `@repo/auth`
- `TenantSessionSync`：切换租户 → invalidate queries → re-bootstrap
- 后端 tenant API **未接**；导航 `filterNavByTenant` 仍用 mock meta

## 禁止

- 在 widget 直接 `createRuoYiClient` 或裸 fetch `/YunYanApi`
- 新路由绕过 `app-layout` clientLoader 自建鉴权
- 假设 `@repo/api-client` refresh 已可用（`VITE_API_URL` / refresh 未配置）
- 前端-only 权限 enforcement（仅做 UI 隐藏）

## 验证

```bash
pnpm --filter @repo/saas-web test
pnpm --filter @repo/saas-web validate
pnpm --filter @repo/auth test
pnpm --filter @repo/ruoyi-api test
```
