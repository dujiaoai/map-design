# saas-marketing

官网应用（`@repo/saas-marketing`），React Router 7 SPA。

## 开发

```bash
pnpm install
pnpm --filter @repo/saas-marketing dev
```

| 项 | 值 |
| --- | --- |
| 端口 | 5180 |
| 路由 | `/`、`/pricing`、`/sign-up`（跳转 Web 个人注册） |

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `VITE_WEB_APP_URL` | saas-web 基址，默认 `http://localhost:5175` |

## 规范

见 [docs/architecture/apps.md](../../docs/architecture/apps.md)。
