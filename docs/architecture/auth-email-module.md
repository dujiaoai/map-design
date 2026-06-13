# 邮箱模块（M1 + M3 已实施）

> **状态**：M1 成员邀请、**M3 密码重置** 已实施（2026-06）。M2/M4 仍为计划。  
> 关联：[auth-foundation.md](./auth-foundation.md) D-02。

## 决策记录

| 项 | 决策 |
| --- | --- |
| 首期场景 | **M1 成员邀请邮件** → **M3 密码重置** |
| 邀请密码策略 | **B 方案**：邮件一次性设密链接，管理员不再手填初始密码 |
| outbox | **要**：`sys_email_outbox` 可追溯、支持重发 |
| 发信环境 | 开发 **MailHog**；测试 `saas.mail.enabled=false` 只记 outbox + 日志链接；**暂无生产 SMTP** |
| 邮箱枚举 | 重置请求统一 **204**，无论邮箱是否存在 |

## 已实现能力

### 数据模型

- `sys_email_outbox`：发信队列与状态（pending/sent/failed）
- `sys_email_verification_token`：邀请/重置 token（仅存 hash，单次消费）

### 后端 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/v1/admin/users` | 邀请用户：`status=invited`，发设密邮件 |
| POST | `/v1/admin/users/{userId}/resend-invite` | 重发邀请 |
| POST | `/v1/admin/tenants/{tenantId}/members` | 租户内邀请成员 |
| POST | `/v1/admin/tenants/{tenantId}/members/{userId}/resend-invite` | 重发成员邀请 |
| POST | `/v1/auth/accept-invite` | `{ token, password }` → 设密、激活、返回登录态 |
| POST | `/v1/auth/password-reset/request` | `{ email, tenantId }` → **204**（防枚举） |
| POST | `/v1/auth/password-reset/confirm` | `{ token, password }` → 设新密、吊销 refresh、返回登录态 |

**登录语义**：`status=invited` 尝试密码登录 → **403** `"Invite pending, check your email to set a password"`。

### 前端

| App | 改动 |
| --- | --- |
| Admin | 邀请设密邮件、`invited` 状态、重发 |
| Web | `/accept-invite`、`/forgot-password`、`/reset-password`；登录页「忘记密码？」 |

### 配置

```yaml
saas:
  mail:
    enabled: true
  app:
    web-base-url: http://localhost:5175
  invite:
    token-ttl-hours: 48
  password-reset:
    token-ttl: PT1H
```

测试 profile：`saas.mail.enabled: false` — outbox + 日志打印链接。

## 本地联调

```bash
docker compose -f services/docker-compose.dev.yml up -d mailhog
# 邀请/重置后：http://localhost:8025 或查 outbox / 应用日志
```

## 后续（未实施）

| 阶段 | 场景 | 说明 |
| --- | --- | --- |
| E3 | M2 注册邮箱验证 | 两阶段注册或 magic link |
| E4 | M4 安全通知 | 改密/禁用/异常登录（可选） |
| — | Rate limit | 按 IP + 邮箱限流（依赖 Redis） |

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 无生产 SMTP | outbox + 日志链接；上线前配置 SMTP |
| 邮件枚举 | 重置 request 恒 204；禁用/邀请账号静默跳过 |
| Token 泄露 | hash 存储、单次有效、短 TTL（重置 1h） |
