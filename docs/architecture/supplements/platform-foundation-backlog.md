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
| P1 | FND-04 | saas-api RLS 扩展（租户业务表） | ✅ |
| P2 | FND-05 | 可观测性最小集（MDC + 依赖健康探活） | ✅ |
| P3 | FND-06 | Admin `/system` 平台配置 | ✅ |
| P3 | FND-07a | Platform Admin 租户代操作（impersonation MVP） | ✅ |
| P3 | FND-07b | Admin MFA 骨架（配置 + 只读 API + 系统页） | ✅ |
| P3 | FND-07c | Admin MFA TOTP 注册/注销 + 登录 step-up | ✅ |
| P3 | FND-07d | 代操作 MFA 门控 | ✅ |
| P3 | FND-07e | Admin MFA recovery codes | ✅ |
| P3 | FND-07f | OAuth2/OIDC 骨架（发现 API + flags） | ✅ |
| P3 | FND-07g | OAuth2/OIDC 授权码登录（Admin） | ✅ |
| P3 | FND-07h | OAuth2/OIDC 授权码登录（saas-web） | ✅ |
| P3 | FND-07i | OIDC 本地联调配置与 runbook | ✅ |
| P3 | FND-07j | OIDC provider subject 绑定表 | ✅ |
| Later | FND-07 | `/v1/menus`、OIDC 解绑 UI、Plan 配额等 | 远期 |

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

**现状**：✅ 已交付（2026-06）。`/system` 只读 flags + Health 条（含 `GET /v1/admin/ping`）。**P4 / P4+ 运维 UX**（控制台壳、计费 Sheet、跨页导航等）见 [apps/admin/README.md](../../../apps/admin/README.md) 与 [apps.md](../apps.md)。

| 能力 | API / UI | 状态 |
| --- | --- | --- |
| 功能开关只读 | `GET /v1/admin/system/flags` | ✅ |
| 邮件/SMTP 状态 | 配置摘要（无密钥） | ✅ |
| 计费模式摘要 | 只读 + 链接 → Admin `/billing` | ✅ |
| 运维链接 | runbook 路径列表 | ✅ |
| Admin API 探活 | Health 条 ping 信号 | ✅ |

**不含**：动态改生产密钥、全量 Spring 配置 CRUD（安全边界另议）。

---

## FND-07a · 租户代操作（impersonation MVP）✅

**交付（2026-06）**：ADR [0007](../../adr/0007-platform-admin-impersonation.md)；JWT `act_as_tenant`；`POST/DELETE /v1/admin/impersonation`；`admin:impersonate`（V25）；`impersonation.start/stop` 审计；Admin 代操作 Sheet + banner。

**不含**：MFA 二次确认、代操作时长上限、saas-web 入口。

---

## FND-07b · Admin MFA 骨架 ✅

**交付（2026-06）**：ADR [0008](../../adr/0008-platform-admin-mfa.md)；`saas.auth.admin-mfa.enforcement-enabled`；`GET /v1/admin/mfa/status`；`system/flags.mfa`；Admin 系统页展示强制开关与当前账号状态。

**不含**：TOTP 注册/校验、登录 step-up、代操作 MFA 门控（→ FND-07c）。

---

## FND-07c · Admin MFA TOTP + 登录 step-up ✅

**交付（2026-06）**：`sys_user_mfa_totp`（V26）；`POST /admin/mfa/totp/enroll|verify`、`DELETE /admin/mfa/totp`；`POST /auth/login/mfa`；Admin 系统页绑定面板 + 登录 MFA 步；`@repo/auth` `LoginMfaRequiredError` / `completeLoginMfa`。

**不含**：recovery codes、代操作前 MFA 门控、saas-web 租户 MFA。

---

## FND-07d · 代操作 MFA 门控 ✅

**交付（2026-06）**：已绑定 TOTP 的平台管理员 `POST /v1/admin/impersonation` 须提交 `totpCode`；Admin 代操作 Sheet 展示 6 位动态码输入；`AdminImpersonationControllerTest` 覆盖门控路径。

**不含**：recovery codes、代操作时长上限、saas-web 租户 MFA。

---

## FND-07e · Admin MFA recovery codes ✅

**交付（2026-06）**：`sys_user_mfa_recovery_code`（V27）；TOTP verify 签发 10 条恢复码；`POST /admin/mfa/recovery-codes/regenerate`；`POST /auth/login/mfa` 与注销 TOTP 可消费恢复码；Admin 系统页展示/重新生成；登录页支持恢复码。

**不含**：代操作时长上限、saas-web 租户 MFA。

---

## FND-07f · OAuth2/OIDC 骨架 ✅

**交付（2026-06）**：ADR [0009](../../adr/0009-oauth2-oidc-login.md)；`saas.auth.oauth2` 配置；`GET /auth/oidc/providers`；`system/flags.oidc`；Admin 系统页与登录页可观测摘要。

**不含**：Authorization Code + PKCE redirect/callback、用户绑定、saas-web 登录按钮（→ FND-07g）。

---

## FND-07g · OAuth2/OIDC 授权码登录（Admin）✅

**交付（2026-06）**：`GET /auth/oidc/{providerId}/authorize`、`POST /auth/oidc/{providerId}/callback`（PKCE S256 + Redis state）；OIDC 邮箱映射已有用户；Admin MFA step-up；`@repo/auth` `startOidcAuthorize` / `completeOidcLogin`；Admin 登录页 IdP 按钮 + `/auth/oidc/callback/:providerId`。ADR [0009](../../adr/0009-oauth2-oidc-login.md) Phase 2 节已更新。

**不含**：saas-web 登录按钮与 callback、显式账号 bind 表、真实 IdP 联调 runbook（→ FND-07h）。

---

## FND-07h · OAuth2/OIDC 授权码登录（saas-web）✅

**交付（2026-06）**：复用 Phase 2 API（`client=web`）；登录页 IdP 按钮；`/auth/oidc/callback/:providerId`；OIDC 回调后 MFA step-up（与密码登录一致）。租户 slug 必填（企业 IdP 登录）。

**不含**：显式账号 bind 表、个人版（无租户）OIDC（→ FND-07i runbook）。

---

## FND-07i · OIDC 本地联调配置与 runbook ✅

**交付（2026-06）**：`application-oidc.example.yml`；`application-dev.yml` / `application-docker.yml` Keycloak 环境变量占位；`.env.example` / `deploy/.env.docker.example`；[oidc-dev-setup.md](../../runbooks/oidc-dev-setup.md)（Keycloak 快速启动、redirect URI、探活与 E2E）。

**不含**：生产 IdP 运维、provider subject 绑定表（→ FND-07j）。

---

## FND-07j · OIDC provider subject 绑定表 ✅

**交付（2026-06）**：Flyway V28 `sys_user_oauth_bind`；`(provider_id, provider_subject)` 唯一；回调优先按 IdP `sub` 解析用户并校验租户；邮箱首次匹配成功时自动 bind。

**不含**：Account/Admin 解绑 UI。

---

## FND-07 · 远期（Later）

| 项 | 说明 |
| --- | --- |
| OIDC 解绑 UI | `/account` 与 Admin 用户详情 |
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
