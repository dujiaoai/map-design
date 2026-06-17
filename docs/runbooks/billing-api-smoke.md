# Billing API 联调冒烟清单

> 对应 [services-development-plan.md](../architecture/services-development-plan.md) Sprint F  
> 前置：[local-dev.md](./local-dev.md) 中 `saas-api` + `billing-api` 已启动；demo 账号已 seed

## 环境准备

| 项 | 要求 |
| --- | --- |
| Docker / 本地 PG | `postgres` 运行中（默认与 saas-api 共用 `saas` 库） |
| saas-api | `:8082` 已启动（JWT 与 billing-api 共用 `SAAS_JWT_SECRET`） |
| billing-api | `:8083` 已启动 |
| 种子数据 | `admin@demo.local` / `password` / tenant `demo`（含 billing 权限） |
| mock-pay | dev/docker 默认 `BILLING_MOCK_PAYMENT=true`（脚本走 mock-pay 路径） |

独立 PostgreSQL（可选）：见 [docker-deployment.md](./docker-deployment.md) §4.3 billing 独立库。

---

## 一、自动化脚本（推荐）

API 已启动时，在仓库根目录：

```bash
pnpm smoke:billing-api
```

或：

```bash
node services/billing-api/scripts/smoke-billing.mjs
```

**默认流程（24 步，mock 渠道）：**

`login` → `users-me` → `membership-check` → `membership-sync-events` → `wallet` → `packages` → `wechat-oauth-config` → `wire-transfer-platform-account` → `recharge-create` → …

（`SMOKE_RECHARGE_CHANNEL=wechat|alipay` 时 mock-pay / recharge-discount-mock-pay 替换为对应 webhook 步骤，总步数仍以脚本输出为准。）

成功输出：`billing smoke OK (24 steps): ...`（mock 渠道）

**PostgreSQL RLS：** dev/docker 默认 `billing.tenant-rls.enabled=true`（`BILLING_TENANT_RLS_ENABLED`）。24 步通过即覆盖 JWT 租户路径与 internal/admin bypass；详见 [billing-tenant-rls.md](../architecture/supplements/billing-tenant-rls.md)。`membership-check` 401 空 body 时多为 saas-api 未重启到含 `/internal/v1/membership` 的版本。

Live 支付凭证与 JSAPI OAuth 联调见 [billing-live-payment-sop.md](./billing-live-payment-sop.md)。

### 环境变量（可选）

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `SAAS_API_BASE_URL` | `http://localhost:8082/v1` | 登录 |
| `BILLING_API_BASE_URL` | `http://localhost:8083/v1/billing` | 用户 billing API |
| `BILLING_ADMIN_BASE_URL` | 由 billing base 推导 | Admin billing API |
| `SMOKE_EMAIL` / `SMOKE_PASSWORD` / `SMOKE_TENANT` | demo 账号 | 同 saas-api 冒烟 |
| `SMOKE_RECHARGE_CHANNEL` | `mock` | `mock` / `wechat` / `alipay` |
| `BILLING_WEBHOOK_TOKEN` | dev token | 与 billing-api 配置一致 |
| `BILLING_WEBHOOK_SIGNATURE_MODE` | `off` | `off` / `hmac` / `wechat_v3` / `alipay_rsa` |
| `BILLING_INTERNAL_TOKEN` | dev token | saas-api `/internal/v1/membership/*` 探活（与 m2m 配置一致） |

Webhook 渠道冒烟（非 mock）需额外配置验签密钥，见 [billing-credits-prd.md](../product/billing-credits-prd.md) §2.4。

---

## 二、Docker Compose 健康检查

容器栈已 `up` 时：

```bash
node .cursor/skills/docker-deploy/scripts/deploy.mjs smoke
```

含 `billing-api health`（宿主机 `BILLING_API_PORT`，默认 `:8085`）。

独立库模式：

```bash
node .cursor/skills/docker-deploy/scripts/deploy.mjs up --billing-db
```

---

## 三、手动 curl（节选）

```bash
# 1. billing 健康
curl -s http://localhost:8083/actuator/health

# 2. 登录（保存 accessToken）
curl -s -X POST http://localhost:8082/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.local","password":"password","tenantId":"demo"}'

# 3. 钱包
curl -s http://localhost:8083/v1/billing/wallet \
  -H "Authorization: Bearer <accessToken>"
```

---

## 验收

- [ ] `pnpm smoke:billing-api` 全步骤通过
- [ ] Docker `deploy.mjs smoke` 中 billing-api health 为 2xx
- [ ] （可选）`SMOKE_RECHARGE_CHANNEL=wechat` + 验签模式通过

## 参考

- [billing-service.md](../architecture/billing-service.md)
- [billing-credits-prd.md](../product/billing-credits-prd.md)
- [billing-live-payment-sop.md](./billing-live-payment-sop.md)
- [billing-reconciliation-alert.md](./billing-reconciliation-alert.md)
- [saas-api-auth-smoke.md](./saas-api-auth-smoke.md)
