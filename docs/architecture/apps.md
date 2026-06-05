# 三 App 规范

## 总表

| 字段 | marketing | web | admin |
| --- | --- | --- | --- |
| 目录 | `saas/apps/marketing` | `saas/apps/web` | `saas/apps/admin` |
| 包名 | `@repo/saas-marketing` | `@repo/saas-web` | `@repo/saas-admin` |
| 端口 dev | 5180 | 5175 | 5181 |
| 渲染 | SSG / SSR 可选 | SPA（`ssr: false`） | SPA |
| 路由 | React Router 7 | React Router 7 | React Router 7 |
| 鉴权 | 公开 + 注册 | 租户 session | 平台管理员 MFA |
| 部署 | 静态 / Edge | 静态 SPA | 内网 / VPN |

## Web（`app.example.com`）

```
/login, /register, /forgot-password
/onboarding/*
/:orgSlug/*
/settings/*
```

开发：

```bash
pnpm --filter @repo/saas-web dev
```

## Admin（`admin.example.com`）

```
/login
/tenants, /tenants/:id
/billing, /audit-logs, /system
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
| `@repo/cloud-uav` | `saas/cloud/uav` | 机库远程 ESM，供宿主动态加载 |

宿主通过 `/yunyan-cloud-uav/` 代理加载（见 `apps/yunyan-web` vite proxy + `loadCloudPluginUav.ts`）。

开发插件：

```bash
pnpm --filter @repo/cloud-uav dev
```

需与宿主（5103）同时运行，插件 dev 端口 **5174**。
