# 本地开发 Runbook

## 前置条件

| 工具 | 版本 | 用途 |
| --- | --- | --- |
| Node.js | ≥ 20.19.0 | 前端 monorepo |
| pnpm | ≥ 9.14.0 | 前端 monorepo |
| Turbo | 2.9.16（根 devDependency，随 `pnpm install` 安装） | 任务编排 |
| **JDK** | **21** | `services/saas-api` |
| **Maven** | 3.9+ | `services/saas-api` |
| **Docker** | 近期版本 | PostgreSQL + Redis（本地 SaaS API） |

## 安装

```bash
pnpm install
```

本仓库自带 `pnpm-workspace.yaml`，可独立安装。若嵌入父 monorepo 的 `saas/` 子目录，则在父仓根目录执行 `pnpm install`。

## 环境变量

复制示例文件并按需修改：

```bash
cp .env.example .env
```

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_APP_BASE_HOST` | `https://www.airace.com.cn` | RuoYi API 代理目标（vite proxy `/YunYanApi`） |
| `VITE_API_URL` | （未设置） | SaaS `/v1` 基址；见下方 [SaaS API](#saas-api) |
| `VITE_SAAS_API_HOST` | `http://localhost:8082` | vite 将 `/v1` 代理到该地址（仅 `VITE_API_URL=/v1` 时需要） |

`.env` 文件放在**仓库根目录**。`apps/web/vite.config.ts` 通过 `loadEnv(mode, repoRoot, '')` 加载。

可选：使用 `--mode airace` 加载 `.env.airace`：

```bash
pnpm --filter @repo/saas-web dev:airace
```

## 启动服务

### 租户工作台（常用）

```bash
pnpm --filter @repo/saas-web dev
```

| 项 | 值 |
| --- | --- |
| 端口 | 5175 |
| 路由 | `/login`、`/`（地图工作台） |
| API 代理 | `http://localhost:5175/YunYanApi` → `VITE_APP_BASE_HOST` |

### SaaS API

`services/saas-api` — 本地 Java 后端，端口 **8082**，路径前缀 `/v1`。

| Sprint | 联调重点 |
| --- | --- |
| C | 登录、**注册**、`users/me`、saas-web 切 SaaS |
| D | `/v1/admin/*`、apps/admin |
| E | 业务 API（Later） |

详见 [services-development-plan.md](../architecture/services-development-plan.md) **§十 执行指引**。迁移完成前 saas-web 可能仍临时走 RuoYi。

#### 1. 启动依赖（PostgreSQL + Redis）

在**仓库根目录**执行：

```bash
docker compose -f services/docker-compose.dev.yml up -d
```

| 服务 | 端口 | 凭据 |
| --- | --- | --- |
| PostgreSQL 16 | 5432 | DB `saas` / 用户 `saas` / 密码 `saas` |
| Redis 7 | 6379 | 无密码 |

检查容器状态：

```bash
docker compose -f services/docker-compose.dev.yml ps
```

#### 2. 启动 API

```bash
mvn -f services/pom.xml -pl saas-api spring-boot:run -Dspring-boot.run.profiles=dev
```

- Flyway 在启动时自动执行 `db/migration/V*.sql` 与 PostgreSQL 专用 `db/migration-postgresql/V5__rls.sql`（`sys_user` RLS）；原理见 [tenant-rls-b05.md](../architecture/supplements/tenant-rls-b05.md)
- Refresh token 写入 Redis（dev profile）
- 健康检查：`http://localhost:8082/actuator/health`
- **Swagger UI**：`http://localhost:8082/swagger-ui.html`
  1. 展开 **Auth** → `POST /v1/auth/login`，用演示账号 Try it out
  2. 复制响应中的 `accessToken`
  3. 点击右上角 **Authorize**，填入 token（或 `Bearer <token>`）
  4. 调试 **Users**、**Tenants** 等受保护接口（Authorize 状态会持久化到刷新页面）
- OpenAPI JSON：`http://localhost:8082/v3/api-docs`

#### 3. 导入演示数据（首次或重置后）

演示账号（租户 slug `demo`）：

| 邮箱 | 密码 | 角色 |
| --- | --- | --- |
| `admin@demo.local` | `password` | TENANT_ADMIN |
| `member@demo.local` | `password` | MEMBER |

**Bash / Git Bash：**

```bash
docker compose -f services/docker-compose.dev.yml exec -T postgres \
  psql -U saas -d saas < services/saas-api/scripts/seed-demo-dev.sql
```

**PowerShell：**

```powershell
Get-Content services/saas-api/scripts/seed-demo-dev.sql -Raw |
  docker compose -f services/docker-compose.dev.yml exec -T postgres psql -U saas -d saas
```

验证种子：

```bash
docker compose -f services/docker-compose.dev.yml exec postgres \
  psql -U saas -d saas -c "SELECT t.slug, u.email, r.code FROM sys_tenant t JOIN sys_user u ON u.tenant_id = t.id LEFT JOIN sys_user_role ur ON ur.user_id = u.id LEFT JOIN sys_role r ON r.id = ur.role_id WHERE t.slug = 'demo';"
```

#### 4. curl 冒烟（不依赖前端）

```bash
# 健康检查
curl -s http://localhost:8082/actuator/health

# 登录
curl -s -X POST http://localhost:8082/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.local","password":"password","tenantId":"demo"}'

# 将上一步返回的 accessToken 代入
curl -s http://localhost:8082/v1/users/me \
  -H "Authorization: Bearer <accessToken>"

# 可访问租户列表
curl -s http://localhost:8082/v1/tenants \
  -H "Authorization: Bearer <accessToken>"
```

#### 5. 与 saas-web 联调（可选）

`.env` 中二选一：

| `VITE_API_URL` | 行为 |
| --- | --- |
| `http://localhost:8082` | 浏览器直连 Java；依赖 CORS（已配置允许 `http://localhost:5175`） |
| `/v1` | 同源请求，由 vite 代理到 `VITE_SAAS_API_HOST`（默认 `http://localhost:8082`） |

```bash
# 终端 1：SaaS API（见上文）
# 终端 2：前端
pnpm --filter @repo/saas-web dev
```

> **说明**：Sprint C 完成后需配置 `VITE_API_URL`，主登录与 bootstrap 走 SaaS + mock-nav。迁移前可用 `/dev/saas-auth-smoke` 联调；完成前工作台可能仍临时走 RuoYi。

#### 6. Auth 端到端冒烟

```bash
pnpm smoke:saas-api
```

完整清单（含前端 `/dev/saas-auth-smoke`）：[saas-api-auth-smoke.md](./saas-api-auth-smoke.md)。

#### 7. 运行测试

```bash
mvn -f services/pom.xml -pl saas-api test
```

#### 停止依赖

```bash
docker compose -f services/docker-compose.dev.yml down
# 保留数据卷：省略 -v
# 清空 PG 数据：docker compose -f services/docker-compose.dev.yml down -v
```

---

### 机库云插件

```bash
pnpm --filter @repo/cloud-uav dev
```

| 项 | 值 |
| --- | --- |
| 端口 | 5174 |
| Base | `/yunyan-cloud-uav/` |
| 独立预览 | `http://localhost:5174/yunyan-cloud-uav/` |

### 与 Vue 宿主联调

需同时启动 `yunyan-web`（父 monorepo，端口 5103）：

```bash
# 终端 1
pnpm --filter @repo/cloud-uav dev

# 终端 2（父 monorepo）
pnpm --filter @taiyi/yunyan-web dev:airace
```

宿主通过 proxy 将 `/yunyan-cloud-uav/*` 转发到 5174。详见 `cloud/uav/README.md`。

### Biome

```bash
pnpm --filter @repo/saas check        # lint
pnpm --filter @repo/saas check:fix    # lint + autofix
pnpm --filter @repo/saas format       # format
```

### 测试

```bash
pnpm test                 # 全 workspace 单测（Turbo）
pnpm validate             # typecheck + test + biome
pnpm --filter @repo/saas-web validate   # 仅 web 包
pnpm --filter @repo/saas-web test:watch # Vitest watch
```

任务编排详见 [turbo.md](./turbo.md)。

## 常见问题

### `catalog:` 依赖解析失败

确保仓库根存在 `pnpm-workspace.yaml` 且含 `catalog` 段。独立 clone 后直接在根目录 `pnpm install`。

### Git dubious ownership

```bash
git config --global --add safe.directory D:/path/to/map-design
```

### 登录 401 / 验证码失败（RuoYi）

- 确认 `VITE_APP_BASE_HOST` 指向可访问的 RuoYi 后端
- 检查浏览器 Network 中 `/YunYanApi/captchaImage` 响应
- 密码经 RSA 加密（`jsencrypt`），需后端公钥匹配

### SaaS API 启动失败

| 现象 | 处理 |
| --- | --- |
| `Connection refused` 5432 / 6379 | 先执行 `docker compose -f services/docker-compose.dev.yml up -d` |
| Flyway 迁移失败 | 检查 PG 是否已有冲突 schema；必要时 `down -v` 后重来 |
| 登录 401 `Invalid email or password` | 确认已执行 `seed-demo-dev.sql`，且 `tenantId` 为 `demo` |
| 前端跨域错误 | 确认 `saas.cors.allowed-origins` 含 `http://localhost:5175`；或改用 `VITE_API_URL=/v1` 走代理 |
| `RedisConnectionFailure` | Redis 容器未启动；dev profile 依赖 Redis 存 refresh token |

### 端口 8082 被占用

```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue

# 或换端口启动（临时）
mvn -f services/pom.xml -pl saas-api spring-boot:run -Dspring-boot.run.profiles=dev -Dspring-boot.run.arguments=--server.port=8083
```

### Cloud UAV 联调 CSS/JS 404

- 插件 `base`、宿主 proxy 前缀、import 路径须一致：`/yunyan-cloud-uav/`
- 宿主 dev 端口非 5103 时：

```bash
CLOUD_PLUGIN_UAV_DEV_ORIGIN=http://localhost:YOUR_PORT pnpm --filter @repo/cloud-uav dev
```

## 嵌入父 Monorepo

若本仓库内容位于父仓 `saas/` 目录：

1. 父仓 `pnpm-workspace.yaml` 含 `"saas/**"`
2. 在父仓根 `pnpm install`
3. env 文件可放在父仓根或 `saas/` 根（取决于 vite `loadEnv` 路径配置）

详见 [../architecture/monorepo.md](../architecture/monorepo.md)。
