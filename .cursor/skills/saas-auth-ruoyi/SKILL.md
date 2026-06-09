---
name: saas-auth-ruoyi
description: >-
  saas-web 认证与会话：Sprint C 为 SaaS /v1 登录、注册、bootstrap、profile（不留 RuoYi）；
  Sprint D 为权限门控与 apps/admin。迁移前仍可能遇到 RuoYi 代码路径。Use when adding
  protected routes, login/register/logout, bootstrap, profile, tenant session sync,
  or choosing ruoyi-api vs api-client.
metadata:
  author: map-design
  version: "1.1.0"
compatibility: Requires map-design apps/web, @repo/auth, @repo/api-client.
---

# SaaS Auth（工作台会话 · Sprint C/D）

## 先读文档

| 主题 | 文档 |
| --- | --- |
| 任务与执行指引 | [services-development-plan.md](../../docs/architecture/services-development-plan.md) **§十** |
| 认证与 RBAC | [auth-rbac.md](../../docs/architecture/auth-rbac.md) |
| 后端集成 | [backend-integration.md](../../docs/architecture/backend-integration.md) |
| ADR | [ADR-0005](../../docs/adr/0005-ruoyi-transitional-backend.md) |

## API 选用（Sprint C 目标 · 不留 RuoYi 会话）

| 场景 | 包 | 禁止 |
| --- | --- | --- |
| 注册、登录、刷新、登出 | `@repo/api-client` → `/v1/auth/*` | RuoYi `login` / 验证码 |
| Bootstrap 用户 / RBAC | `@repo/api-client` → `GET /v1/users/me` | RuoYi `getUserInfo` |
| 侧栏导航 | `mock-nav-items` + registry + `filterNavByTenant` | RuoYi `getMenuRouters`、`/v1/menus` |
| Profile 读/写/改密 | `@repo/api-client` → `/v1/users/me*` | RuoYi profile 端点 |
| 租户列表 / 能力 | `@repo/api-client` → `/v1/tenants*` | — |
| App 数据层 | `shared/queries/*` + TanStack Query | widget 裸 fetch |

迁移前代码可能仍引用 `@repo/ruoyi-api` — 新工作应直接按上表实现并删除 RuoYi 调用。

## 注册 / 登录 → 工作台链路（Sprint C 目标）

```
routes/register.tsx（C-07）
  → api-client: POST /v1/auth/register { email, password, tenantId?, ... }
  → auth.setSession → navigate /

routes/login.tsx（C-06）
  → api-client: POST /v1/auth/login { email, password, tenantId }
  → auth.setSession(access, refresh, user)
  → navigate /

layouts/app-layout.tsx clientLoader
  → auth.requireAuthenticated(redirect)
  → bootstrapAuthenticatedApp()
  → GET /v1/users/me + mock-nav + filterNavByTenant(features)
  → 失败 → clearAppSession → redirect /login
```

### Mock 开发

`shared/mock/dev-auth.ts`：`MOCK_ACCESS_TOKEN` 跳过网络，bootstrap 用 mock 用户与 mock-nav。本地 Playwright / 无后端时用。

## 关键模块

| 职责 | 路径 |
| --- | --- |
| Auth 实例 | `apps/web/app/shared/auth/instance.ts`（须配置 `apiBaseUrl` + refresh） |
| API client | `apps/web/app/shared/api/client.ts` |
| Bootstrap | `apps/web/app/shared/session/bootstrap-authenticated-app.ts` |
| 登出清理 | `apps/web/app/shared/session/clear-app-session.ts` |
| 租户切换 | `apps/web/app/shared/session/tenant-session-sync.tsx` |
| 导航 mock | `entities/navigation/model/mock-nav-items.tsx` |
| 登录页 | `apps/web/app/routes/login.tsx` |
| 注册页 | `apps/web/app/routes/register.tsx`（规划 C-07） |
| 守卫 layout | `apps/web/app/layouts/app-layout.tsx` |

迁移清理目标：bootstrap **不再** import `ruoyi-client`、`menu-queries`（RuoYi）、`ruoyi-profile-store`。

## 新增受保护路由 checklist

1. 在 `app/routes.ts` 注册，挂到 `app-layout` 子路由
2. **不要**重复写 token 检查 — 依赖 `clientLoader` 的 `requireAuthenticated`
3. 需角色：`requireRole()` / `hasRole()`（角色来自 `SessionDto.user.roles`）
4. 新 SaaS 数据：在 `shared/queries/` 加 query options，经 `@repo/api-client`
5. 401/403：走 `clearAppSession()`，勿只清 localStorage 一半

## 账号 / Profile（Sprint C）

- 读/写/改密：仅 `/v1/users/me*`
- **禁止** `getUserProfile` / `updateUserProfile` / `updateUserPassword`（RuoYi）

## 租户

- `TenantProvider` / `useTenant()` 来自 `@repo/auth`
- `TenantSessionSync`：切换租户 → 重新登录（目标 slug）
- `GET /v1/tenants`、`GET /v1/tenants/{id}/features` 接 TeamSwitcher 与 `filterNavByTenant`

## Sprint D（权限 · 不在本 Skill 主路径）

- 细粒度权限码、`requirePermission` — 对齐 `/v1/admin/roles/*/permissions`
- `apps/admin` — 见 `saas-fsd-feature`；saas-web 去掉 `entities/ruoyi-user/lib/permissions.ts` 转换

## 禁止

- 在 widget 直接 `createRuoYiClient` 或裸 fetch `/YunYanApi`（新代码）
- bootstrap 调用 RuoYi `getInfo` / `getMenuRouters`
- 前端-only 权限 enforcement（仅 UX 隐藏）
- 登录 / profile 与 RuoYi 双轨并行

## 验证

```bash
pnpm smoke:saas-api
pnpm --filter @repo/saas-web test
pnpm --filter @repo/saas-web validate
pnpm --filter @repo/auth test
```
