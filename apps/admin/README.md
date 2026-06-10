# saas-admin

平台运营后台（`@repo/saas-admin`），React Router 7 SPA。

| 项 | 值 |
| --- | --- |
| 包名 | `@repo/saas-admin` |
| 端口 dev | **5181** |
| API | `/v1/admin/*`（Vite 代理 → saas-api :8082） |

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
```

浏览器打开 http://localhost:5181/login ，使用 `admin@demo.local` / `password` / 租户 `demo`。

## 路由

| 路径 | 说明 |
| --- | --- |
| `/login` | SaaS 登录 |
| `/` | 概览（admin ping 自检） |
| `/tenants` | 租户列表预览 |
| `/users` | 用户列表预览 |
| `/roles` | 角色列表预览 |
| `/403` | 无运营权限 |

完整 CRUD 表格 → Sprint **D-08**。
