# @repo/saas-web

SaaS **租户工作台**（React Router 7.16 SPA），包名 `@repo/saas-web`。

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 19 + React Router 7.16（`ssr: false`） |
| UI | `@repo/ui`（Tailwind 4 + shadcn） |
| 数据 | TanStack Query + `@repo/api-client` |
| 鉴权 | `@repo/auth`（Session / Tenant Provider、RBAC） |
| 表单 | React Hook Form + Zod（`features/profile`） |
| Lint / Format | Biome（`saas/biome.json`） |
| 测试 | Vitest + Testing Library |

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 工作台首页 |
| `/login` | 登录（邮箱密码 + OIDC IdP 按钮） |
| `/auth/oidc/callback/:providerId` | OIDC 授权码回调 |
| `/register` | 注册（加入已有租户，需 `VITE_API_URL`） |
| `/settings/profile` | 个人资料（RHF + Zod 示例） |
| `/:orgSlug` | 组织动态路由骨架 |

## 目录（FSD 轻量骨架）

```
app/
├── layouts/          # 路由布局（auth / app + clientLoader 守卫）
├── routes/           # 路由页面
├── providers/        # 全局 Provider（QueryClient 等）
├── shared/           # config、lib、auth/client、api/client
├── features/
│   ├── dashboard/    # model: Zustand store 示例
│   └── profile/        # model: Zod schema · ui: ProfileForm
├── entities/         # 领域实体
└── widgets/          # 复合 UI 块
```

## 命令

在 monorepo 根目录：

```bash
pnpm --filter @repo/saas-web dev          # 开发（默认 5175）
pnpm --filter @repo/saas-web dev:airace   # airace 模式
pnpm --filter @repo/saas-web build
pnpm --filter @repo/saas-web typecheck
pnpm --filter @repo/saas-web lint          # Biome check（saas 全目录）
pnpm --filter @repo/saas-web lint:fix
pnpm --filter @repo/saas-web format
pnpm --filter @repo/saas-web validate      # typecheck + lint + test
```

或根目录快捷脚本：`pnpm dev:saas-web`

## 鉴权与 API

- **`@repo/auth`**：`app/shared/auth/client.ts` 创建 `auth` 实例（`storageKeyPrefix: saas-web`）
- **`@repo/api-client`**：`app/shared/api/client.ts` 注入 token 与 401 刷新
- 受保护路由：`layouts/app-layout.tsx` 调用 `auth.requireAuthenticated(redirect)`
- `/login`：配置 `VITE_API_URL` 后走 `auth.login()` → `POST /v1/auth/login`（邮箱 + 密码 + 租户 slug）；已配置 OIDC 时可用 IdP 按钮（须填租户）；未配置时降级为 `auth.devLogin()` 占位会话
- `/register`：`auth.register()` → `POST /v1/auth/register`（邮箱 + 密码 ≥8 位 + 租户 slug + 可选显示名），成功后查收验证邮件；`/verify-email?token=...` 确认后登录
- Bootstrap / 顶栏用户：`useWorkspaceSession` + `GET /v1/users/me`；**无** `ruoyi-profile-store`（C-08～C-12）
- 侧栏：`mock-nav-items` + **C-09 ✅** `filterNavMainItemsForTenant`（`useEnabledTenantFeatures`）
- Account 抽屉：`GET/PUT /v1/users/me`、`POST /v1/users/me/password`（C-10）
- 侧栏 TeamSwitcher：`GET /v1/tenants`；切换租户 = 目标 slug 重新登录（C-11）
- 组件内：`useSession()`、`useTenant()`（须在 Provider 内）

本地联调示例：`.env` 设置 `VITE_API_URL=/v1`，`vite.config` 代理至 `http://localhost:8082`；演示账号 `admin@demo.local` / `password` / `demo`（需 `seed-demo-dev.sql`）。

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_API_URL` | 后端 API 基址（可选，Zod 校验） |
| `VITE_APP_URL` | 当前应用公网 URL（可选） |

## 地图工作台

首页 `/` 为地图工作台：`AppSidebar` 菜单 → `map-workspace` store → Dock / 浮层 / 右侧条带。

侧栏菜单 UI 载体选型、两种 Drawer 区分、新增菜单检查清单见 [map-workspace-ui.md](../../docs/architecture/map-workspace-ui.md)。

## 相关文档

- [saas/README.md](../../README.md) — SaaS 产品线总览
- [frontend.md](../../docs/architecture/frontend.md) — 前端架构规范
- [map-workspace-ui.md](../../docs/architecture/map-workspace-ui.md) — 侧栏菜单与 UI 载体规范
