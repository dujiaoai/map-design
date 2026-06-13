# 邮箱模块（M1 + M2 + M3 已实施）

> **状态**：M1 邀请、**M2 注册验证**、M3 密码重置 已实施（2026-06）。M4 仍为计划。  
> 关联：[auth-foundation.md](./auth-foundation.md) D-02 / D-06。

## 决策记录

| 项 | 决策 |
| --- | --- |
| 首期场景 | M1 邀请 → M3 重置 → **M2 注册验证** |
| 注册流程 | 两阶段：`POST /register` 发验证邮件 → `POST /register/confirm` 激活并登录 |
| 待验证状态 | `unverified`；验证前登录返回 **403** |
| outbox | **要**：可追溯 |
| 发信环境 | 测试 `saas.mail.enabled=false` 只记 outbox + 日志链接 |

## 已实现 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/v1/auth/register` | 创建 `unverified` 用户，**204** |
| POST | `/v1/auth/register/confirm` | `{ token }` → 激活 + 登录态 |
| POST | `/v1/auth/accept-invite` | 邀请设密 |
| POST | `/v1/auth/password-reset/request` | 重置请求 **204** |
| POST | `/v1/auth/password-reset/confirm` | 重置确认 + 登录态 |
| Admin 邀请/重发 | 见 M1 |

## 前端

| 路由 | 说明 |
| --- | --- |
| `/register` | 提交后提示查收验证邮件 |
| `/verify-email?token=...` | 自动确认并进入工作台 |
| `/forgot-password` / `/reset-password` | M3 |
| `/accept-invite` | M1 |

## 配置

```yaml
saas:
  registration:
    token-ttl: PT24H
  password-reset:
    token-ttl: PT1H
  invite:
    token-ttl: PT48H
```

## 后续

| 项 | 说明 |
| --- | --- |
| M4 安全通知 | 改密/禁用提醒（可选） |
| Rate limit | ✅ 见 [auth-foundation.md](./auth-foundation.md) C-04 |
