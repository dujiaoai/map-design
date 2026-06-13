# 邮箱模块计划（待决策）

> **状态**：仅计划，**未实施**。确认范围与优先级后再开发。  
> 关联：[auth-foundation.md](./auth-foundation.md) P1 B-05 / P3 D-02。

## 背景

当前邀请/注册流程均为 **明文初始密码 + 管理员手填**，无邮箱验证、无邮件通知。产品方向是先把账号体系做深，邮件能力作为**可选增量**，避免一次性引入过多运维依赖。

## 目标场景（按价值排序）

| 优先级 | 场景 | 用户价值 |
| --- | --- | --- |
| M1 | **成员邀请邮件** | 管理员邀请后，用户收到「加入租户」链接/临时凭证说明 |
| M2 | **自助注册邮箱验证** | 注册时发验证码/魔法链接，降低垃圾注册 |
| M3 | **密码重置** | 忘记密码 → 邮件链接 → 设置新密码（无需管理员） |
| M4 | **安全通知** | 改密、禁用、异常登录提醒（可选） |

建议首期只做 **M1 或 M3 其一**，不要四场景并行。

## 技术方案草案

### 1. 基础设施

| 项 | 建议 |
| --- | --- |
| 发信方式 | 开发：`MailHog` / `GreenMail`（Testcontainers）；生产：SMTP（企业邮箱）或云厂商 SES/阿里云邮件推送 |
| Spring 集成 | `spring-boot-starter-mail` + `JavaMailSender`；模板用 Thymeleaf 或纯文本 |
| 配置 | `application.yml`：`spring.mail.*`；密钥走环境变量，不进仓库 |
| 异步 | `@Async` 或 Spring 事件 `ApplicationEventPublisher`，避免接口阻塞 |
| 失败策略 | 首期：记日志 + 审计；不重试风暴；Admin 可「重新发送」 |

### 2. 数据模型（若做 M1/M2/M3）

```
sys_email_outbox（可选，推荐）
  id, tenant_id, user_id, template, to_email, payload_json,
  status(pending/sent/failed), error_message, created_at, sent_at

sys_email_verification_token（M2/M3）
  id, user_id, purpose(register/reset/invite), token_hash,
  expires_at, consumed_at
```

- **邀请（M1）**：`POST /v1/admin/users` 成功后入队 outbox；邮件含租户名 + 登录 URL（不含明文密码，改为「联系管理员」或一次性设置密码链接）
- **注册验证（M2）**：`POST /v1/auth/register` 改为两阶段：`register/request` 发码 → `register/confirm` 完成；或 magic link
- **重置（M3）**：`POST /v1/auth/password-reset/request` + `POST /v1/auth/password-reset/confirm`

### 3. API 契约（首期 M1 示例）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/v1/admin/users` | 行为扩展：`sendInviteEmail=true`（默认 false，兼容现网） |
| POST | `/v1/admin/users/{id}/resend-invite` | 重发邀请（需 `admin:users:write`） |

邮件正文**不应**包含长期明文密码；与现有「管理员填初始密码」流程需产品二选一：

- **A**：保留手填密码，邮件仅通知账号已创建 + 登录地址  
- **B**：改为邮件内一次性设置密码链接（推荐长期方案）

### 4. 前端改动

| App | 改动 |
| --- | --- |
| Admin 邀请表单 | 勾选「发送邀请邮件」；成功 toast 区分「已创建 / 已发信」 |
| Web 注册 | M2 时增加验证码步骤 UI |
| Web 登录 | M3 时增加「忘记密码」入口 |

### 5. 安全与合规

- Token 仅存 **hash**（SHA-256 + pepper），单次有效、15～60 分钟过期
- 重置/注册接口 **防枚举**：统一返回「若邮箱存在将收到邮件」
- Rate limit：按 IP + 邮箱（依赖 P2 C-04 Redis，可先做内存限流）
- 审计：`admin_audit_log` 记录 `invite.email.sent` / `password-reset.requested`

### 6. 测试策略

- 单元：`MailSender` mock，断言模板变量
- 集成：Testcontainers GreenMail 或 `@MockBean JavaMailSender`
- E2E：不依赖真实 SMTP；smoke 脚本跳过发信

## 工作量粗估

| 阶段 | 内容 | 估时 |
| --- | --- | --- |
| E0 | Mail 配置 + outbox 表 + 发送骨架 | 0.5～1d |
| E1 | M1 邀请邮件（A 方案：仅通知） | 1d |
| E2 | M3 密码重置全链路 | 1.5～2d |
| E3 | M2 注册验证 | 1.5～2d |

## 依赖与风险

| 风险 | 缓解 |
| --- | --- |
| 无 SMTP 环境 | 本地 MailHog；CI 用 GreenMail |
| 与「手填密码邀请」产品冲突 | 首期 `sendInviteEmail` 默认关，文档写清 |
| 多租户发信域名/模板 | 首期单模板 + 租户名变量即可 |

## 建议决策点（请你确认）

1. **首期场景**：M1 邀请 / M3 重置 / M2 注册验证 — 选哪一个？
2. **邀请密码策略**：继续手填（A）还是邮件设密链接（B）？
3. **发信环境**：是否已有企业 SMTP 或云服务账号？
4. **是否入库 outbox**：要可追溯重发 → 建议要；仅日志 → 可省略

确认后再单独开 `feat(auth): 邮箱模块 E*` commit 系列，与当前 P1 用户生命周期改动隔离。
