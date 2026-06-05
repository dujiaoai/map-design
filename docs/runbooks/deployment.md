# 部署 Runbook

## 构建

```bash
pnpm --filter @haoxuan/saas-web build:airace
pnpm --filter @haoxuan/cloud-uav build
```

产物：

| App | 目录 |
| --- | --- |
| Web | `saas/apps/web/build/client/` |
| Cloud UAV | `saas/cloud/uav/dist/` |

## SPA Fallback

Nginx：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Cloud UAV 与宿主

- 插件 base：`/yunyan-cloud-uav/`
- 宿主 dev proxy：`5103` → `5174`（`apps/yunyan-web/vite.config.js`）
- 同时启动：

```bash
pnpm --filter @haoxuan/cloud-uav dev
pnpm --filter @taiyi/yunyan-web dev:airace
```

## Cookie 域

- Web：`app.example.com`
- Admin：`admin.example.com`
- 除非设计 SSO，否则不共用 session cookie

## 环境变量

| App | 说明 |
| --- | --- |
| Web | `VITE_API_URL`、`VITE_APP_URL` |
| Marketing | 可无 API secret |
| Admin | 更严格 CSP |

## Smoke Test

- [ ] Web 首页 200
- [ ] 登录跳转（占位路由就绪后）
- [ ] Cloud UAV registry.js 可加载
