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
| **状态** | 占位 README | **活跃开发** | **Sprint D** 脚手架 |

## Web（`app.example.com`）

### 已实现路由

| 路由 | 组件 | 说明 |
| --- | --- | --- |
| `/login` | `routes/login.tsx` | SaaS `POST /v1/auth/login`（C-06 ✅） |
| `/register` | `routes/register.tsx` | SaaS `POST /v1/auth/register`（C-07 ✅） |
| `/` | `routes/home.tsx` | 地图工作台首页 |

### 规划路由（Sprint C 后）

```
/forgot-password          # Later
/onboarding/*             # Later
/:orgSlug/*               # Later
/settings/*               # feature 已有，路由待注册
```

> **Sprint C 进度**：C-06～C-12 ✅（身份与会话主路径 → `@repo/api-client`）。**C-09 菜单 filter 暂缓**。下一步 Sprint D。  
> **不做**：地图/机库等业务 API（Sprint E）。

开发：

```bash
pnpm --filter @repo/saas-web dev
```

## Admin（`admin.example.com`）· Sprint D

| 路由 | 说明 |
| --- | --- |
| `/login` | SaaS 登录（`PLATFORM_ADMIN`） |
| `/tenants` | 租户列表 / 创建（`/v1/admin/tenants`） |
| `/tenants/:id` | 租户详情、成员 |
| `/users` | 用户列表（`/v1/admin/users`） |
| `/roles` | 角色与**权限配置** |

```
/billing, /audit-logs, /system   # Later
```

开发：

```bash
pnpm --filter @repo/saas-admin dev
```

**注意**：≠ `apps/yunyan-admin`（若依 Vue 后台）。

## Marketing（`www.example.com`）

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
