# 三 App 规范

## 总表

| 字段 | marketing | web | admin |
| --- | --- | --- | --- |
| 目录 | `apps/marketing` | `apps/web` | `apps/admin` |
| 包名 | `@repo/saas-marketing` | `@repo/saas-web` | `@repo/saas-admin` |
| 端口 dev | 5180 | 5175 | 5181 |
| 渲染 | SSG / SSR 可选 | SPA（`ssr: false`） | SPA |
| 路由 | React Router 7 | React Router 7 | React Router 7 |
| 鉴权 | 公开 + 注册 | 租户 session | 平台管理员 MFA |
| 部署 | 静态 / Edge | 静态 SPA | 内网 / VPN |
| **状态** | **已 scaffold**（`/pricing`） | **活跃开发** | **P0～P3 已交付** |

## Web（`app.example.com`）

### 已实现路由

| 路由 | 组件 | 说明 |
| --- | --- | --- |
| `/login` | `routes/login.tsx` | SaaS `POST /v1/auth/login`（C-06 ✅） |
| `/register` | `routes/register.tsx` | SaaS 注册（组织/个人/邮箱确认） |
| `/forgot-password` | `routes/forgot-password.tsx` | 自助密码重置（SaaS） |
| `/reset-password` | `routes/reset-password.tsx` | 重置密码确认 |
| `/verify-email` | `routes/verify-email.tsx` | 注册邮箱验证 |
| `/accept-invite` | `routes/accept-invite.tsx` | 邀请链接加入 |
| `/join` | `routes/join.tsx` | 邀请码加入 |
| `/` | `routes/home.tsx` | 地图工作台首页 |

### 规划路由

```
/onboarding/*             # Later
/:orgSlug/*               # Later
/settings/*               # feature 已有，路由待注册
```

> **Sprint C 进度**：C-06～C-12 ✅（身份与会话主路径 → `@repo/api-client`；C-09 侧栏/命令面板按 tenant features 过滤）。Sprint D Admin 已交付。  
> **不做**：地图/机库等业务 API（Sprint E）。

开发：

```bash
pnpm --filter @repo/saas-web dev
```

## Admin（`admin.example.com`）· P0～P3 ✅

**状态**：第一期 MVP 已交付（2026-06）。`PLATFORM_ADMIN` 负责全平台运营；`TENANT_ADMIN`（具备 `admin:members:*`）可管理本租户成员。  
**注意**：≠ `apps/yunyan-admin`（若依 Vue 后台）。

### 角色与默认落点

| 角色 | 默认首页 | 能力范围 |
| --- | --- | --- |
| `PLATFORM_ADMIN` | `/` 概览 | 统计、租户/用户/角色、跨租户成员、租户能力开关 |
| `TENANT_ADMIN` | `/members` | 本租户成员邀请、编辑、角色分配 |

### 已实现路由

| 路由 | 说明 |
| --- | --- |
| `/login` | SaaS 登录（记住凭据供 TeamSwitcher 切租户） |
| `/` | 运营概览（`GET /v1/admin/stats` + `GET /v1/admin/ping`） |
| `/tenants` | 租户列表、创建、编辑；服务端 `q` / `page` / `size` |
| `/tenants/:tenantId` | 租户详情（`?tab=` 信息 / 成员 / 自定义角色 / 能力；快捷跳转用户与计费） |
| `/users` | 跨租户用户列表、邀请、编辑；可按 `?tenantId=` 筛选 |
| `/members` | 成员管理；`?tenantId=`（平台可跨租户，租户管理员仅本租户） |
| `/roles` | 角色与权限配置（未保存切换确认） |
| `/account` | 当前账号资料（`PUT /users/me`）与改密 |
| `/audit-logs` | 成员操作审计日志（`GET /v1/admin/audit-logs`） |
| `/billing` | 平台计费运营（SKU/调账/退款/对账/发票/对公） |
| `/system` | 平台配置只读摘要（`GET /v1/admin/system/flags`） |
| `/403` | 无运营权限 |
| `*` | 404 友好页（按会话返回概览或登录） |

### 已实现 Admin API（节选）

| 能力 | 端点 |
| --- | --- |
| 平台统计 | `GET /v1/admin/stats` |
| 租户 CRUD + 分页 | `GET/POST/PATCH /v1/admin/tenants`；`GET /v1/admin/tenants/{id}` |
| 租户能力 | `GET /v1/admin/feature-catalog`；`GET/PUT /v1/admin/tenants/{id}/features` |
| 用户 CRUD + 分页 | `GET/PATCH /v1/admin/users`（成员邀请见 invite-links） |
| 成员与角色 | `GET/PATCH /v1/admin/tenants/{id}/members`；`PUT .../roles`；邀请见 invite-links |
| 审计日志 | `GET /v1/admin/audit-logs`（成员写操作 + crossTenant 标记） |
| 权限配置 | `GET /v1/admin/roles`、`/permissions`；`GET/PUT /v1/admin/roles/{id}/permissions` |

列表页 loading 使用 Skeleton；Vitest + MockMvc 覆盖 P0～P3 核心路径。

### 规划（P4 · 进行中 / Later）

| 状态 | 项 |
| --- | --- |
| ✅ | `/audit-logs` 列表 + `sys_admin_audit_log` + 成员写操作落库 |
| ✅ | `/billing` 计费运营 Tab（对接 billing-api `/v1/admin/billing`） |
| ✅ | `/system` 平台配置只读页（`GET /v1/admin/system/flags`） |
| Later | impersonation、Admin MFA |

开发：

```bash
pnpm --filter @repo/saas-admin dev
```

联调账号见 [`apps/admin/README.md`](../../apps/admin/README.md)。

## Marketing（`www.example.com`）

本地开发：`pnpm dev:marketing`（`:5180`），定价页跳转 Web 注册见 `VITE_WEB_APP_URL`。

```
/
/pricing
/docs
/sign-up    → 跳转 Web onboarding
```

## Cloud 模块

| 包名 | 路径 | 说明 |
| --- | --- | --- |
| `@repo/cloud-uav` | `cloud/uav` | 机库远程 ESM，供 Vue 宿主动态加载 |

宿主通过 `/yunyan-cloud-uav/` 代理加载（见父 monorepo `apps/yunyan-web` vite proxy + `loadCloudPluginUav.ts`）。

开发插件：

```bash
pnpm --filter @repo/cloud-uav dev
```

需与宿主（5103）同时运行，插件 dev 端口 **5174**。详见 [../runbooks/local-dev.md](../runbooks/local-dev.md)。

## 相关 ADR

- [ADR-0002](../adr/0002-three-app-split.md) — 三 App 拆分
- [ADR-0003](../adr/0003-spa-vs-ssr-by-app.md) — 渲染模式
- [ADR-0006](../adr/0006-esm-remote-plugin-over-mf.md) — Cloud ESM 插件
