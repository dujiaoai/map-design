# ADR-0008: Platform Admin MFA（TOTP）

## Status

Accepted（Phase 2 TOTP 注册/登录 step-up 已落地；代操作门控仍 Later）

## Context

Platform Admin 可代操作任意租户（[ADR-0007](./0007-platform-admin-impersonation.md)）、读写审计与计费。高权限账号仅依赖 Email/Password + JWT，缺少二次因子。FND-07 路线图将 Admin MFA 列为远期能力；需先落地可观测的配置与 API 契约，避免后续 enrollment 与登录流返工。

## Decision

### 1. 因子与范围

- **首期目标因子**：TOTP（RFC 6238，兼容 Google Authenticator / 1Password 等）。
- **范围**：仅 `PLATFORM_ADMIN`（具备 `admin:tenants:read` 等平台权限的账号）；saas-web 租户成员 MFA 不在本期。
- **配置**（`application.yml` / 环境变量）：

| 键 | 默认 | 含义 |
| --- | --- | --- |
| `saas.auth.admin-mfa.enforcement-enabled` | `false` | 为 `true` 时，已注册 TOTP 的平台管理员登录须通过 MFA 步（Phase 2） |

### 2. 骨架 API（Phase 1 — 本期）

| 方法 | 路径 | 权限 | 行为 |
| --- | --- | --- | --- |
| GET | `/v1/admin/mfa/status` | `admin:tenants:read` | 返回平台强制开关 + 当前用户 enrollment 摘要（骨架期 `enrolled=false`、`totpEnrollmentAvailable=false`） |

`GET /v1/admin/system/flags` 增加 `mfa` 段：`enforcementEnabled`、`totpEnrollmentAvailable`、`enrolledPlatformAdminCount`（骨架期计数为 0）。

### 3. 后续迭代（Phase 2 — 明确不做于骨架）

| 能力 | 说明 |
| --- | --- |
| `user_mfa_totp` 表 | 每用户 secret（加密存储）、verified_at、recovery codes |
| POST `/v1/admin/mfa/totp/enroll` | 签发 otpauth URI + 临时 secret |
| POST `/v1/admin/mfa/totp/verify` | 确认 6 位码并完成注册 |
| DELETE `/v1/admin/mfa/totp` | 注销（须 MFA 或 break-glass） |
| 登录 step-up | `enforcement-enabled` 且已注册时，`/v1/auth/login` 返回 `mfaRequired` + 短期 challenge token |
| 代操作门控 | `POST /v1/admin/impersonation` 前校验近期 MFA（与 FND-07a 联动） |

### 4. 审计

Phase 2 起：`mfa.totp.enroll` / `mfa.totp.verify` / `mfa.totp.disable`；骨架期无写操作审计。

## Consequences

### 正面

- Admin「系统」页可展示 MFA 策略与实现阶段；联调契约稳定。
- 强制开关可先部署为 `false`，上线 enrollment 后再切 `true`。

### 负面

- 骨架期 `enrolled` 恒为 `false`，不可真实绑定 TOTP。
- Phase 2 需 Flyway 迁移、登录响应扩展与 Admin 设置 UI，工作量独立估算。

## References

- [0007-platform-admin-impersonation.md](./0007-platform-admin-impersonation.md)
- [platform-foundation-backlog.md](../architecture/supplements/platform-foundation-backlog.md) FND-07
