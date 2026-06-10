# Docker 部署故障排查

## cloud-uav 构建：`Could not load src/components/ui/avatar`

**原因**：`cloud/uav/vite.config.ts` 将**所有** `@/` 解析到插件 `src/`，`packages/ui` 内部 `@/components/ui/*` 在 Docker/Rolldown 构建时失败。

**修复**：按 FSD 前缀分流——插件目录走 `cloud/uav/src`，其余 `@/` 走 `packages/ui/src`。见 `cloud/uav/vite.config.ts` 中 `PLUGIN_ALIAS_PREFIXES`。

验证：`pnpm build:uav` 通过后再 `docker compose build cloud-uav`。

---

## `/YunYanApi/captchaImage` 返回 Nginx 404

**原因**：`proxy_pass ${RUOYI_API_UPSTREAM}/;` 剥离了 `/YunYanApi` 前缀，上游实际路径为 `/YunYanApi/captchaImage`。

**修复**：`deploy/nginx/saas-web.conf.template`：

```nginx
location /YunYanApi {
    proxy_pass ${RUOYI_API_UPSTREAM};
}
```

验证：对比 `curl https://www.airace.com.cn/YunYanApi/captchaImage` 与 `curl http://localhost:8084/YunYanApi/captchaImage` 状态码一致。

---

## API 200 但 body 为 `{"code":500,"msg":"404 NOT_FOUND"}`

**原因**：上游 RuoYi 业务响应，非 Nginx/反代配置问题。

**处理**：确认 `RUOYI_API_UPSTREAM` 指向正确环境；与直连 upstream 对比 body。

---

## `docker build` 拉取 docker.io 超时

1. 移除 Dockerfile 首行 `# syntax=docker/dockerfile:1`
2. 预拉镜像：`docker pull node:20-alpine` / `nginx:1.27-alpine`
3. 配置 Docker Desktop 镜像加速（用户环境）

---

## saas-web 构建慢

Docker 内 `pnpm install --frozen-lockfile` 每次冷启动约 2–3 分钟属正常。利用 Docker 层缓存：仅改源码时勿动 `package.json` 层。

---

## PowerShell 中 `curl -sI` 报错

Windows 下 `curl` 是 `Invoke-WebRequest` 别名。冒烟脚本使用 `curl.exe`。

---

## 端口占用

修改 `deploy/.env` 中 `SAAS_WEB_PORT` / `CLOUD_UAV_PORT`，或 `docker compose down` 释放。
