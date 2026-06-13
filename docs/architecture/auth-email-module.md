# 邮箱模块（M1 已实施）

> **状态**：M1 成员邀请设密链接 **已实施**（2026-06）。M2/M3/M4 仍为计划。  
> 关联：[auth-foundation.md](./auth-foundation.md) D-02。

## 决策记录

| 项 | 决策 |
| --- | --- |
| 首期场景 | **M1 成员邀请邮件** |
| 邀请密码策略 | **B 方案**：邮件一次性设密链接，管理员不再手填初始密码 |
| outbox | **要**：`sys_email_outbox` 可追溯、支持重发 |
| 发信环境 | 开发 **MailHog**（`services/docker-compose.dev.yml`）；测试 `saas.mail.enabled=false` 只记 outbox + 日志链接；**暂无生产 SMTP** |

## 已实现能力

### 数据模型

- `sys_email_outbox`：发信队列与状态（pending/sent/failed）
- `sys_email_verification_token`：邀请 token（仅存 hash，48h 有效，单次消费）

### 后端 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/v1/admin/users` | 邀请用户：`status=invited`，发设密邮件 |
| POST | `/v1/admin/users/{userId}/resend-invite` | 重发邀请 |
| POST | `/v1/admin/tenants/{tenantId}/members` | 租户内邀请成员 |
| POST | `/v1/admin/tenants/{tenantId}/members/{userId}/resend-invite` | 重发成员邀请 |
| POST | `/v1/auth/accept-invite` | `{ token, password }` → 设密、激活、返回登录态 |

**登录语义**：`status=invited` 尝试密码登录 → **403** `"Invite pending, check your email to set a password"`。

### 前端

| App | 改动 |
| --- | --- |
| Admin | 邀请表单去掉密码；文案「发送设密邮件」；`invited` 状态徽章；编辑页可重发 |
| Web | `/accept-invite?token=...` 设密页；登录错误本地化 |

### 配置

```yaml
# application.yml（节选）
saas:
  mail:
    enabled: true
  app:
    web-base-url: http://localhost:5173
  invite:
    token-ttl-hours: 48
spring.mail:
  host: localhost
  port: 1025   # MailHog
```

测试 profile：`saas.mail.enabled: false` — 不入 SMTP，outbox + 日志打印 accept 链接。

## 本地联调

```bash
# 启动 MailHog
docker compose -f services/docker-compose.dev.yml up -d mailhog

# 管理端邀请后，在 http://localhost:8025 查看邮件
# 或查 sys_email_outbox.payload_json / 应用日志中的 accept 链接
```

## 后续（未实施）

| 阶段 | 场景 | 说明 |
| --- | --- | --- |
| E2 | M3 密码重置 | `password-reset/request` + `confirm` |
| E3 | M2 注册邮箱验证 | 两阶段注册或 magic link |
| E4 | M4 安全通知 | 改密/禁用/异常登录（可选） |

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 无生产 SMTP | outbox 记录 + Admin 重发；上线前配置企业邮箱/云推送 |
| 邮件枚举 | M3 实施时统一响应文案 + rate limit |
| Token 泄露 | 仅存 hash、单次有效、短 TTL |
