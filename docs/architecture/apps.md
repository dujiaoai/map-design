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
| **状态** | 占位 README | **活跃开发** | 占位 README |

## Web（`app.example.com`）

### 已实现路由

| 路由 | 组件 | 说明 |
| --- | --- | --- |
| `/login` | `routes/login.tsx` | RuoYi 验证码登录 |
| `/` | `routes/home.tsx` | 地图工作台首页 |

### 规划路由

```
/register, /forgot-password
/onboarding/*
/:orgSlug/*
/settings/*
```

> account feature（profile 表单、改密）已实现，settings 路由尚未注册。

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
