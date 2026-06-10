---
name: docker-deploy
description: >-
  Build and run map-design frontend Docker stack (saas-web + cloud-uav) via
  deploy/docker-compose.yml. Use when the user asks for Docker deploy, 本地部署,
  docker compose, 容器启动, smoke test, or updating deploy/nginx configs—even if
  they only say "继续部署" or "重新 build 镜像".
metadata:
  author: map-design
  version: "1.0.0"
compatibility: Docker Desktop (Linux engine), pnpm monorepo at repo root, deploy/ directory.
---

# Docker 本地/预发部署（map-design）

## 架构速览

| 服务 | 镜像 | 默认端口 | 产物 |
| --- | --- | --- | --- |
| `postgres` + `redis` | 官方镜像 | 内部 | saas-api 依赖 |
| `saas-api` | `map-design/saas-api` | 8082 | Spring Boot `/v1` |
| `saas-web` | `map-design/saas-web` | 8084 | SPA + `/v1`、`/YunYanApi` 反代 |
| `saas-admin` | `map-design/saas-admin` | 8083 | 运营后台 SPA + `/v1` 反代 |
| `cloud-uav` | `map-design/cloud-uav` | 8081 | `/yunyan-cloud-uav/assets/*.js` |
| `gateway`（可选 profile） | nginx | 9080 | 同域聚合 |

配置文件：`deploy/`（Dockerfile、nginx、compose）。完整方案见 [docs/runbooks/docker-deployment.md](../../docs/runbooks/docker-deployment.md)。

## 一键部署（优先）

**Windows PowerShell（仓库根目录）：**

```powershell
node .cursor/skills/docker-deploy/scripts/deploy.mjs up
```

**参数：**

| 命令 | 作用 |
| --- | --- |
| `up` | 构建并启动（默认） |
| `up --gateway` | 额外启动统一网关 :9080 |
| `smoke` | 对已运行容器做 HTTP 冒烟 |
| `down` | 停止并移除容器 |
| `ps` | 查看状态 |
| `logs` | 跟踪日志 |
| `rebuild` | 无缓存重建 saas-api、saas-web、saas-admin、cloud-uav |

## Agent 标准工作流

用户要求部署时，**必须实际执行命令**（非仅输出说明）：

```
Task Progress:
- [ ] 确认 Docker daemon 可用（docker version）
- [ ] 确认 deploy/.env 存在（无则从 .env.docker.example 复制）
- [ ] 运行 deploy.mjs up（或 rebuild）
- [ ] 运行 deploy.mjs smoke
- [ ] 汇报 URL 与失败项
```

### 1. 环境

```bash
docker version
```

`deploy/.env` 关键项：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `RUOYI_API_UPSTREAM` | `https://www.airace.com.cn` | RuoYi 根地址（不含路径） |
| `SAAS_WEB_PORT` | `8084` | Web 映射端口 |
| `SAAS_ADMIN_PORT` | `8083` | Admin 映射端口 |
| `SAAS_API_PORT` | `8082` | API 映射端口（调试） |
| `CLOUD_UAV_PORT` | `8081` | UAV 映射端口 |
| `BUILD_MODE` | `production` | `airace` 时用 build:airace |

### 2. 构建与启动

```bash
node .cursor/skills/docker-deploy/scripts/deploy.mjs up
```

等价于在 `deploy/` 执行 `docker compose up -d --build`。

### 3. 冒烟（必须）

```bash
node .cursor/skills/docker-deploy/scripts/deploy.mjs smoke
```

期望：

| 检查 | URL | 期望 |
| --- | --- | --- |
| SPA 首页 | `http://localhost:{SAAS_WEB_PORT}/` | HTTP 200 |
| SaaS 反代 | `http://localhost:{SAAS_WEB_PORT}/v1/ping` | HTTP 200 |
| API 健康 | `http://localhost:{SAAS_API_PORT}/actuator/health` | HTTP 200 |
| Admin SPA | `http://localhost:{SAAS_ADMIN_PORT}/` | HTTP 200 |
| API 反代 | `http://localhost:{SAAS_WEB_PORT}/YunYanApi/captchaImage` | HTTP 200（body 与直连 upstream 一致） |
| UAV registry | `http://localhost:{CLOUD_UAV_PORT}/yunyan-cloud-uav/assets/registry.js` | HTTP 200 |

### 4. 用户验证

- 浏览器打开 `http://localhost:8084/`（或 `.env` 中端口）
- 登录页可加载；Network 中 `/YunYanApi/*` 非浏览器直连外域

## 修改 deploy 时的约束

### Nginx `/YunYanApi` 反代

**必须保留路径前缀**（与 Vite dev proxy 一致）：

```nginx
location /YunYanApi {
    proxy_pass ${RUOYI_API_UPSTREAM};
}
```

❌ 禁止 `proxy_pass ${RUOYI_API_UPSTREAM}/;`（会剥前缀，导致 404）。

### cloud-uav 构建

`cloud/uav/vite.config.ts` 中 `@/` 分流：

- 插件 FSD：`shared|app|pages|modules|…` → `cloud/uav/src`
- 其余 `@/` → `packages/ui/src`

改 alias 后本地先 `pnpm build:uav`，再 Docker build。

### Dockerfile

- 勿加 `# syntax=docker/dockerfile:1`（国内易拉取失败）
- 构建在 monorepo 根 context，`dockerfile: deploy/Dockerfile.*`

## 故障排查

详见 [references/troubleshooting.md](references/troubleshooting.md)。

| 现象 | 首要检查 |
| --- | --- |
| cloud-uav build 报 `@/components/ui/*` 找不到 | vite alias 是否把 ui 的 `@/` 指到 `packages/ui/src` |
| `/YunYanApi/*` 404 | `saas-web.conf.template` 是否保留前缀转发 |
| Docker Hub 拉取 maven/temurin 超时 | `Dockerfile.saas-api` 已改用本地缓存的 `node:20-alpine` + Alpine OpenJDK/Maven |
| `/v1/ping` smoke 401 | Spring Security 仅放行 GET；smoke 对 API 用 GET 而非 HEAD |
| 容器 unhealthy | `docker compose logs saas-web` / `cloud-uav` |

## 与本地 dev 的关系

| 场景 | 命令 |
| --- | --- |
| 日常开发 | `pnpm dev`（:5175，Vite 热更新） |
| 验收生产构建 | Docker `saas-web` :8084 |
| 验收 UAV 静态包 | Docker `cloud-uav` :8081 |

不要在容器内跑 `pnpm dev`。
