# ADR-0012：审计 Webhook HMAC 签名

> 状态：Accepted · 2026-06  
> 关联：[admin-platform-evolution.md](../product/admin-platform-evolution.md) Phase 9-2

## 背景

Phase 8 已实现审计日志 Webhook 批量 HTTP 推送与死信表。SIEM 接收方需要验证 payload 未被篡改，业界惯例为 HMAC-SHA256 请求签名。

## 决策

1. **签名算法**：`HmacSHA256`，密钥来自 `saas.audit.webhook-signing-secret`。
2. **请求头**：`X-Webhook-Signature: sha256=<hex>`，与 Stripe/GitHub Webhook 风格一致。
3. **空密钥**：未配置 signing secret 时不发送签名头（向后兼容 dev/test）。
4. **Admin 可观测**：`GET /v1/admin/audit-logs/webhook-config` 返回 `signatureEnabled` 布尔字段。
5. **告警**：投递失败写入死信后，`AuditWebhookAlertService` 在死信数为 10 的倍数时打 warn 日志（后续可接 PagerDuty）。

## 后果

- 接收方须按相同算法校验 body 原文与 hex 摘要。
- 密钥轮换需运维同时更新 saas-api 与 SIEM 配置。
- Phase 10 可扩展为 Ed25519 或非对称密钥。
