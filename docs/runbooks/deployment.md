# 部署 Runbook

> **Docker 部署**：完整方案见 [docker-deployment.md](./docker-deployment.md)（含 `deploy/` 目录 Dockerfile 与 compose）。

## 构建

```bash
pnpm build:web:airace   # 或 pnpm build:web
pnpm build:uav
# 等价于 turbo run build --filter=...
```

产物：

| App | 目录 |
| --- | --- |
| Web | `apps/web/build/client/` |
| Cloud UAV | `cloud/uav/dist/` |

## SPA Fallback

Nginx：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Cloud UAV 与宿主

- 插件 base：`/yunyan-cloud-uav/`
- 宿主 dev proxy：`5103` → `5174`（父 monorepo `apps/yunyan-web/vite.config.js`）
- 同时启动：

```bash
pnpm --filter @repo/cloud-uav dev
pnpm --filter @taiyi/yunyan-web dev:airace
```

详见 [local-dev.md](./local-dev.md) 与 [ADR-0006](../adr/0006-esm-remote-plugin-over-mf.md)。

## Cookie 域

- Web：`app.example.com`
- Admin：`admin.example.com`
- 除非设计 SSO，否则不共用 session cookie

## 环境变量

| App | 变量 | 说明 |
| --- | --- | --- |
| Web | `VITE_APP_BASE_HOST` | RuoYi API 代理目标 |
| Web | `VITE_API_URL` | SaaS REST API（规划） |
| Web | `VITE_APP_URL` | 前端自身 URL（规划） |
| Marketing | — | 可无 API secret |
| Admin | — | 更严格 CSP |

## Smoke Test

- [ ] Web 首页 200
- [ ] 登录跳转正常
- [ ] RuoYi API 代理可达
- [ ] Cloud UAV registry.js 可加载
