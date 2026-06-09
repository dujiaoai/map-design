---
name: saas-auth-ruoyi
description: >-
  saas-web 认证与会话：C-06～C-08 已切 SaaS 登录/注册/bootstrap；C-09 菜单 filter 暂缓；
  C-10 Account/profile ✅；C-11+ TeamSwitcher；Sprint D 权限与 admin。Use when adding protected routes,
  login/register/logout, bootstrap, profile, tenant session sync, or choosing ruoyi-api vs api-client.
metadata:
  author: map-design
  version: "1.2.0"
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

## Sprint C 进度（2026-06）

| 编号 | 状态 |
| --- | --- |
| C-01～C-05 | ✅ 后端 auth + `users/me` |
| C-06～C-08 | ✅ 登录、注册、bootstrap 去 RuoYi |
| C-09 | ⏸ **暂缓** — 不做 `filterNavByTenant` / 菜单路由权限 |
| C-10 | ✅ Account UI → `users/me*` |
| C-11～C-12 | 待做 — TeamSwitcher、RuoYi 清理 |

## API 选用

| 场景 | 包 | 禁止 |
| --- | --- | --- |
| 注册、登录、刷新、登出 | `@repo/api-client` → `/v1/auth/*` | RuoYi `login` / 验证码 |
| Bootstrap 用户 | `@repo/api-client` → `GET /v1/users/me` | RuoYi `getUserInfo` / `getMenuRouters` |
| 侧栏导航 | `mock-nav-items` + registry（**全量**） | RuoYi `getMenuRouters`；C-09 前不接 `filterNavByTenant` |
| Profile 读/写/改密 | `@repo/api-client` → `/v1/users/me*`（C-10 ✅） | 新代码勿增 RuoYi profile |
| 租户列表 / 能力 | `GET /v1/tenants*`（C-11 TeamSwitcher） | — |
| App 数据层 | `shared/queries/*` + TanStack Query | widget 裸 fetch |

`ruoyi-profile-store` 桥接在 C-12 前仍保留 — **新工作**按上表实现，勿增 RuoYi profile 调用。

## 注册 / 登录 → 工作台链路（当前）

```
routes/register.tsx → auth.register() → POST /v1/auth/register → navigate /
routes/login.tsx    → auth.login()    → POST /v1/auth/login    → navigate /

layouts/app-layout.tsx clientLoader
  → auth.requireAuthenticated(redirect)
  → bootstrapAuthenticatedApp()
  → GET /v1/users/me（或 MOCK_ACCESS_TOKEN 分支）
  → mock-nav-items 全量（无 filterNavByTenant）
  → 失败 → clearAppSession → redirect /login
```

### Mock 开发

`shared/mock/dev-auth.ts`：`MOCK_ACCESS_TOKEN` 跳过网络，bootstrap 用 mock 用户与 mock-nav。

## 关键模块

| 职责 | 路径 |
| --- | --- |
| Auth 实例 | `apps/web/app/shared/auth/instance.ts` |
| API client | `apps/web/app/shared/api/client.ts` |
| Bootstrap | `apps/web/app/shared/session/bootstrap-authenticated-app.ts` |
| SaaS 会话拉取 | `apps/web/app/shared/session/fetch-saas-session.ts` |
| 登出清理 | `apps/web/app/shared/session/clear-app-session.ts` |
| 导航 mock | `entities/navigation/model/mock-nav-items.tsx` |
| 登录 / 注册 | `routes/login.tsx`、`routes/register.tsx` |
| 守卫 layout | `apps/web/app/layouts/app-layout.tsx` |

Bootstrap **不再** import `menu-queries`（RuoYi）或调用 `getUserInfo` / `getMenuRouters`。过渡期仍写 `ruoyi-profile-store`（C-12 移除）。

## 新增受保护路由 checklist

1. 在 `app/routes.ts` 注册，挂到 `app-layout` 子路由
2. **不要**重复写 token 检查 — 依赖 `clientLoader` 的 `requireAuthenticated`
3. 需角色：`requireRole()` / `hasRole()`（角色来自 `SessionDto.user.roles`）
4. 新 SaaS 数据：在 `shared/queries/` 加 query options，经 `@repo/api-client`
5. 401/403：走 `clearAppSession()`，勿只清 localStorage 一半

## 账号 / Profile（C-10 目标）

- 读/写/改密：仅 `/v1/users/me*`
- **禁止**新增 `getUserProfile` / `updateUserProfile` / `updateUserPassword`（RuoYi）

## 租户

- `TenantProvider` / `useTenant()` 来自 `@repo/auth`
- `TenantSessionSync`：切换租户 → 重新登录（目标 slug）
- TeamSwitcher + `filterNavByTenant`：**C-09/C-11**，当前不实现菜单权限过滤

## Sprint D（权限 · 不在本 Skill 主路径）

- 细粒度权限码、`requirePermission` — 对齐 `/v1/admin/roles/*/permissions`
- `apps/admin` — 见 `saas-fsd-feature`

## 禁止

- 在 widget 直接 `createRuoYiClient` 或裸 fetch `/YunYanApi`（新代码）
- bootstrap 调用 RuoYi `getInfo` / `getMenuRouters`
- 登录 / profile 与 RuoYi 双轨并行
- **擅自实现 C-09** `filterNavByTenant`（除非用户明确要求）

## 验证

```bash
pnpm smoke:saas-api
pnpm --filter @repo/saas-web test
pnpm --filter @repo/auth test
```
