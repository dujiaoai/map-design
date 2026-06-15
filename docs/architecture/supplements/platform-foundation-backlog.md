# 平台基础完善 Backlog（非业务）

> 状态：Living doc · 2026-06-15  
> 关联：[services-development-plan.md](../services-development-plan.md)、[auth-foundation.md](../auth-foundation.md)

**范围**：身份、租户、权限、后台、计费基础设施、部署、质量与运维。**不含**地图/机库/专题等业务 API 及业务扣费价目（→ Sprint E）。

Sprint A～D、RBAC-P、Sprint F 骨架 + sec 已 ✅；以下为收束基础盘时的建议顺序。

---

## 优先级总览

| 优先级 | 编号 | 主题 | 状态 |
| --- | --- | --- | --- |
| P0 | FND-01 | 文档与计划对齐 | ✅ |
| P1 | FND-02 | Testcontainers（PG + RLS 关键路径） | ✅ |
| P1 | FND-03 | 计费 live 退款 / 对公 / runbook 生产化 | ✅（live 退款；对公认款仍 Later） |
| P1 | FND-04 | saas-api RLS 扩展（租户业务表） | 待做 |
| P2 | FND-05 | 可观测性最小集（MDC + 依赖健康探活） | 待做 |
| P3 | FND-06 | Admin `/system` 平台配置 | 待做 |
| Later | FND-07 | OAuth2/OIDC、Admin MFA、impersonation | 远期 |

---

## FND-01 · 文档与计划对齐

| 项 | 说明 |
| --- | --- |
| services-development-plan §七 | 更新为「基础完善 backlog」，移除已过时的 Sprint C/D 开工项 |
| README / apps.md | Account → SaaS ✅；Admin `/billing` 已交付；auth 路由状态 |
| auth-foundation | 邮箱验证/邀请/重置已 ✅，与主计划交叉引用 |

---

## FND-02 · Testcontainers

**目标**：补 H2 与 PostgreSQL（RLS、类型）差异；至少 1 条 saas-api auth + 1 条 billing-api 钱包路径。

| 产出 | 说明 |
| --- | --- |
| `postgres` JUnit tag | 默认 `mvn test` 仍走 H2；`-Pintegration` 跑 PG |
| saas-api | 登录 + `sys_user` RLS 隔离冒烟 |
| billing-api | 钱包读写 + `billing_*` RLS 冒烟 |

**命令**：`mvn -f services/pom.xml -pl saas-api,billing-api -Pintegration test`（需 Docker；无 Docker 时 `@Testcontainers(disabledWithoutDocker = true)` 自动跳过）

---

## FND-03 · 计费基础生产化

**目标**：stub/mock 之外，live 路径可运维验收（仍非业务扣费）。

| 项 | 骨架 | 待完善 |
| --- | --- | --- |
| live 支付 | F-2.5 ✅ | 生产凭证 + Webhook 域名联调（[billing-live-payment-sop.md](../../runbooks/billing-live-payment-sop.md)） |
| live 退款 | mock 网关 | Provider/Gateway 委托 + 微信/支付宝 SDK 退款 + SOP 验收项 |
| 发票 | 申请/审核 | 电子票平台、PDF 托管、邮件 |
| 对公转账 | 人工审核 | 汇款自动认款 |
| 独立 DB | compose 可选 | 生产分库 + membership CDC/push SLA |

---

## FND-04 · saas-api RLS 扩展

**原则**：[tenant-rls-b05.md](./tenant-rls-b05.md) 同款：PostgreSQL-only 迁移 + `TenantRlsDataSource` + 应用表白名单。

| 阶段 | 表 | 说明 |
| --- | --- | --- |
| FND-04a | `map_layer` | ✅ RLS + MyBatis 租户白名单 |
| FND-04b | 后续业务表 | 新表 Flyway 后追加 `migration-postgresql/V*__rls_<table>.sql` |

新增租户表 checklist：

1. 列 `tenant_id UUID NOT NULL` + FK `sys_tenant`
2. `SaasTenantLineHandler.TENANT_TABLES` 注册（若走 MyBatis-Plus）
3. `migration-postgresql` RLS 策略（FOR ALL + bypass）
4. Testcontainers 用例：租户 A token 不可见租户 B 行

---

## FND-05 · 可观测性最小集

| 项 | 产出 |
| --- | --- |
| 结构化日志 | JWT 认证后 MDC：`tenantId`、`userId`；请求结束清理 |
| 依赖探活 | saas-api `HealthIndicator` → billing-api `/actuator/health`（`saas.billing.enabled=true` 时） |
| 远期 | OpenTelemetry、Sentry（见 architecture README） |

---

## FND-06 · Admin `/system`（平台配置）

**现状**：`routes/system.tsx` 为 ComingSoon。

**P4 最小范围（建议）**：

| 能力 | API / UI | 说明 |
| --- | --- | --- |
| 功能开关只读 | `GET /v1/admin/system/flags` | 公开注册开关、密码强度、rate-limit 等 |
| 邮件/SMTP 状态 | 配置摘要（无密钥） | 邀请/验证/重置是否可用 |
| 计费模式摘要 | 只读链接 → Admin `/billing` | provider-mode、mock-pay 禁用状态 |
| 运维链接 | 文档 / runbook 外链 | smoke、compose、RLS 说明 |

**不含**：动态改生产密钥、全量 Spring 配置 CRUD（安全边界另议）。

---

## FND-07 · 远期（Later）

| 项 | 说明 |
| --- | --- |
| OAuth2/OIDC | X-01 |
| Admin MFA | 高权限账号 |
| impersonation | `act_as_tenant` + 审计（multi-tenancy.md） |
| `/v1/menus` | 服务端动态菜单（当前 mock-nav） |
| Plan 配额 | seat / rate / storage |
| Marketing 完整站 | 官网除 `/pricing` 外页面 |

---

## 验收节奏

每完成一项 FND-*：

1. 更新本表状态列
2. `services-development-plan.md` §十一 索引同步
3. 相关 runbook / supplement 链接
4. `mvn test`（+ `-Pintegration` 若涉及 PG）

---

## 参考

| 文档 | 说明 |
| --- | --- |
| [multi-tenancy.md](../multi-tenancy.md) | JWT 租户、RLS 表清单 |
| [billing-service.md](../billing-service.md) | billing-api 拓扑与 sec 索引 |
| [auth-email-module.md](../auth-email-module.md) | 邮件验证/邀请/重置 |
| [java-backend-testing](../../.cursor/skills/java-backend-testing/SKILL.md) | Testcontainers 约定 |
