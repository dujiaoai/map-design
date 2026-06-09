# SaaS Auth 联调冒烟清单

> 对应 [services-development-plan.md](../architecture/services-development-plan.md) Sprint A · A-03  
> 前置：[local-dev.md](./local-dev.md#saas-api) 中依赖与 API 已启动

## 环境准备


| 项            | 要求                            |
| ------------ | ----------------------------- |
| Docker       | `postgres` + `redis` 容器运行中    |
| saas-api     | `:8082` 已启动（dev profile）      |
| 种子数据         | 已执行 `seed-demo-dev.sql`       |
| `.env`（前端联调） | `VITE_API_URL=/v1`（走 vite 代理） |


`.env` 示例（仓库根目录）：

```env
VITE_API_URL=/v1
VITE_SAAS_API_HOST=http://localhost:8082
```

> RuoYi 登录链路**无需修改**；本清单仅验证 SaaS `/v1` Auth 独立可用。

---

## 一、自动化脚本（推荐）

API 已启动时，在仓库根目录：

```bash
pnpm smoke:saas-api
```

或：

```bash
node services/saas-api/scripts/smoke-auth.mjs
```

覆盖：`health` → `register`（唯一邮箱）→ `login` → `users/me` → `refresh` → `users/me`（新 token）→ `logout` → `refresh`（应 401）。

环境变量（可选）：


| 变量                  | 默认                         |
| ------------------- | -------------------------- |
| `SAAS_API_BASE_URL` | `http://localhost:8082/v1` |
| `SMOKE_EMAIL`       | `admin@demo.local`         |
| `SMOKE_PASSWORD`    | `password`                 |
| `SMOKE_TENANT`      | `demo`                     |


---

## 二、手动 curl 检查

```bash
# 1. 健康
curl -s http://localhost:8082/actuator/health

# 2. 登录（保存 JSON）
curl -s -X POST http://localhost:8082/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.local","password":"password","tenantId":"demo"}'

# 3. users/me（替换 <accessToken>）
curl -s http://localhost:8082/v1/users/me \
  -H "Authorization: Bearer <accessToken>"

# 4. refresh（替换 <refreshToken>）
curl -s -X POST http://localhost:8082/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'

# 5. 用新 accessToken 再请求 users/me

# 6. 登出（替换 <accessToken>）
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8082/v1/auth/logout \
  -H "Authorization: Bearer <accessToken>"
# 期望 204

# 7. 登出后 refresh 应 401
curl -s -X POST http://localhost:8082/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

---

## 三、前端独立验证页（`VITE_API_URL=/v1`）

1. 确认 `.env` 含 `VITE_API_URL=/v1`
2. 启动 API + 前端：

```bash
# 终端 1：saas-api（若未运行）
mvn -f services/pom.xml -pl saas-api spring-boot:run -Dspring-boot.run.profiles=dev

# 终端 2
pnpm --filter @repo/saas-web dev
```

1. 浏览器打开：`http://localhost:5175/dev/saas-auth-smoke`
2. 按页内步骤依次点击：**SaaS 登录** → **GET /users/me** → **刷新 Token** → 再次 **GET /users/me**
3. 确认每步状态为成功，且用户邮箱为 `admin@demo.local`

该页面仅在 **开发构建**（`import.meta.env.DEV`）下可用，不替代 `/login` RuoYi 流程。

---

## 四、验收勾选

- [x] `pnpm smoke:saas-api` 输出 `PASS`
- [x] 登录响应含 `accessToken`、`refreshToken`、`expiresIn`
- [x] `GET /v1/users/me` 返回 `user.email` + `roles`
- [x] `POST /v1/auth/refresh` 返回新 token 对
- [x] 刷新后 `users/me` 仍返回 200
- [x] `POST /v1/auth/logout` 返回 204，且 refresh 被吊销
- [x] （可选）`/dev/saas-auth-smoke` 四步全部成功

---

## 五、常见失败


| 现象                   | 处理                                       |
| -------------------- | ---------------------------------------- |
| `login` 401          | 执行种子 SQL；`tenantId` 必须为 `demo`           |
| `ECONNREFUSED :8082` | 启动 saas-api 或检查端口                        |
| 前端页提示未配置 API         | 根目录 `.env` 设置 `VITE_API_URL=/v1` 后重启 dev |
| `refresh` 401        | Redis 未启动；`docker compose` 拉起 redis      |
| 代理 502               | `VITE_SAAS_API_HOST` 指向正确 Java 地址        |


