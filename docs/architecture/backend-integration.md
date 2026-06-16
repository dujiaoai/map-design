# 后端集成

## 策略总览

| 阶段 | saas-web / admin | 客户端 | 说明 |
| --- | --- | --- | --- |
| **当前（C-06～C-12 + Admin P0～P3）** | 身份与会话 + 运营后台 → SaaS | `@repo/api-client` | `/v1/admin/*`、apps/admin 已交付 |
| 遗留 | `build-nav-tree` 等类型引用 | `@repo/ruoyi-api`（非会话路径） | 随业务迁移逐步移除 |
| **Sprint C** | 身份与会话 | `@repo/api-client` | C-01～C-12 ✅（含 C-09 tenant features 侧栏过滤） |
| **Sprint D** | 权限与后台 | `@repo/api-client` | `/v1/admin/*`、apps/admin ✅ |
| **Sprint E** | 业务工作台 | `@repo/api-client` | 地图、机库等 — **C/D 不做** |

详见 [services-development-plan.md](./services-development-plan.md)、[ADR-0005](../adr/0005-ruoyi-transitional-backend.md)。

## API 选用（Sprint C/D 目标）

| 场景 | 路径 | Sprint |
| --- | --- | --- |
| 注册 | `POST /v1/auth/register` | C |
| 登录、刷新、登出 | `/v1/auth/login`、`/refresh`、`/logout` | C |
| 用户信息 | `GET/PUT /v1/users/me`、`POST .../password` | C |
| 租户、能力 | `/v1/tenants`、`/features`、**`/quotas`（FND-08c ✅）** | B（已就绪） |
| 侧栏导航 | **FND-08 ✅** `GET /v1/menus` + mock fallback | C-09 tenant features 过滤保留于 fallback |
| 权限配置、后台 | `/v1/admin/*` | D ✅（Admin P0～P3 增强） |
| 地图 / 机库 / 专题 | `/v1/layers`、`/v1/uav/*` 等 | **E（Later）** |

App 层：`shared/queries/` + TanStack Query；UI 不直接调 client。

## RuoYi（saas-web 下线进度）

| 方法 | saas-web 状态 |
| --- | --- |
| `login()`、`getCodeImg()` | ✅ 已下线（C-06） |
| `getUserInfo()`、`getMenuRouters()` | ✅ bootstrap 已下线（C-08） |
| `users/me*` | ✅ Account UI（C-10） |

`@repo/ruoyi-api` 包保留；**禁止**新增 RuoYi 会话/bootstrap 调用。

## 环境

- `VITE_API_URL=/v1` → vite 代理 → `saas-api :8082`
- Sprint C 起工作台主路径**必须**配置上述变量

## Sprint C 数据流

```mermaid
sequenceDiagram
  participant Login as login/register
  participant API as api-client
  participant SaaS as /v1
  participant Bootstrap as bootstrapAuthenticatedApp

  Login->>API: register 或 login
  API->>SaaS: POST /auth/*
  SaaS-->>Login: JWT + user
  Bootstrap->>API: GET /users/me
  Bootstrap->>Bootstrap: mock-nav + filterNavMainItemsForTenant（C-09 ✅）
```

## Sprint D 数据流（概要）

- `PLATFORM_ADMIN` / `TENANT_ADMIN` → `apps/admin` → `/v1/admin/stats|tenants|users|members|roles|features`
- saas-web：`requireRole` / 权限码与 `users/me` 或 JWT claims 一致

## 菜单与导航

**当前（C-09 ✅）：**

```
mock-nav-items + registry
  → filterNavMainItemsForTenant(enabledTenantFeatures)
  → AppSidebar / WorkspaceCommandPalette
```

`enabledTenantFeatures` 来自 `GET /v1/tenants/{id}/features`（`useEnabledTenantFeatures`）。

不经过 RuoYi `getRouters`；不提供 `/v1/menus`（Sprint C/D）。

## 业务域（Sprint E）

地图图层、机库、专题等 API **不在** [services-development-plan.md](./services-development-plan.md) Sprint C/D 范围内；单独 PRD 后排期。

**已落地**：`GET/POST/PUT/DELETE /v1/layers`（E-01，2026-06）。
