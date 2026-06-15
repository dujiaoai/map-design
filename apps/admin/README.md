# saas-admin

平台运营后台（`@repo/saas-admin`），React Router 7 SPA。**P0～P3 第一期 MVP 已交付**。

| 项 | 值 |
| --- | --- |
| 包名 | `@repo/saas-admin` |
| 端口 dev | **5181** |
| API | `/v1/admin/*`（Vite 代理 → saas-api :8082） |
| 架构说明 | [docs/architecture/apps.md](../../docs/architecture/apps.md) |

**≠** `apps/yunyan-admin`（若依 Vue 后台）。

## 开发

根目录需配置 `.env`（与 saas-web 共用）：

```env
VITE_API_URL=/v1
VITE_SAAS_API_HOST=http://localhost:8082
```

```bash
pnpm install
pnpm --filter @repo/saas-admin dev
# 或根目录：pnpm dev:admin
```

浏览器打开 http://localhost:5181/login（需先执行 `scripts/seed-demo-dev.sql`）。

### 联调账号

| 角色 | 邮箱 | 密码 | 租户 slug | 默认首页 |
| --- | --- | --- | --- | --- |
| 平台运营 | `admin@demo.local` | `password` | `demo` | `/` 概览 |
| 纯平台运营 | `platform@demo.local` | `password` | `demo` | `/` 概览 |
| 租户管理员 | `tenantadmin@demo.local` | `password` | `demo` | `/members` |
| 普通成员 | `member@demo.local` | `password` | `demo` | 无 Admin 权限 → `/403` |

## 路由

| 路径 | 说明 | 权限 |
| --- | --- | --- |
| `/login` | SaaS 登录 | 公开 |
| `/` | 运营概览（`GET /v1/admin/stats` + ping） | `admin:tenants:read` 等 |
| `/tenants` | 租户列表、创建、编辑；服务端分页/搜索 | `admin:tenants:read` |
| `/tenants/:tenantId` | 租户详情（`?tab=` 信息 / 成员 / 自定义角色 / 能力；快捷跳转用户与计费） | `admin:tenants:read` |
| `/users` | 用户列表、邀请、编辑；`?tenantId=` 筛选 | `admin:users:read` |
| `/members` | 成员管理；`?tenantId=`（平台可跨租户） | `admin:members:read` 或平台角色 |
| `/tenant-roles` | 租户自定义角色与权限配置 | `admin:members:read` 或平台角色 |
| `/roles` | 系统角色权限（平台级） | `admin:roles:read` |
| `/account` | 账号资料与改密 | 已登录 |
| `/billing` | 计费运营（钱包、SKU、订单、调账、对账等 Tab） | `admin:billing:*` |
| `/audit-logs` | 审计日志列表 | `admin:tenants:read` |
| `/system` | 平台配置只读摘要与健康条（`GET /v1/admin/system/flags`） | `admin:tenants:read` |
| `/403` | 无运营权限 | — |
| `*` | 404 友好页 | — |

## 已实现能力（P0～P3 + P4 运维 UX）

- **P0**：平台统计卡片、三列表客户端筛选、`TENANT_ADMIN` 落点 `/members`
- **P1**：租户详情、跨租户成员、`GET/PUT` 租户能力
- **P2**：租户/用户服务端分页、`/account`、侧栏 TeamSwitcher（remember-login）
- **P3**：列表/详情 Skeleton、全局 404、`pnpm validate`（Vitest）
- **P4 运维控制台 UX**：工业深色网格壳、Health 条（含 ping）、列表 stagger 入场、租户详情 URL Tab、快捷入口、403/404 统一错误页

## 验证

```bash
pnpm --filter @repo/saas-admin validate
cd services/saas-api && mvn test -Dtest=Admin*ControllerTest
```

### Docker 全栈联调

```bash
node .cursor/skills/docker-deploy/scripts/deploy.mjs up
node .cursor/skills/docker-deploy/scripts/deploy.mjs smoke
```

- Admin：http://localhost:8083/login（`admin@demo.local` / `password` / `demo`）
- 若本机 `mvn spring-boot:run` 占用 8082，在 `deploy/.env` 设置 `SAAS_API_PORT=18082`

## Later（P4 余项）

邮箱邀请、impersonation 审计深化、Admin MFA（FND-07）。
