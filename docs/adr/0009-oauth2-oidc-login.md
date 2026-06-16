# ADR-0009: OAuth2/OIDC 登录（骨架）

## Status

Accepted（Phase 1 配置与只读 API 已落地；Authorization Code + PKCE 仍 Later）

## Context

SaaS 主路径当前为 Email/Password + JWT（[auth-rbac.md](../architecture/auth-rbac.md)）。产品标准 X-01 预留 OAuth2/OIDC 作为企业 IdP 与企业 SSO 入口。需在不影响现有登录的前提下，先固定配置键、公开发现 API 与 Admin 可观测性，避免后续接入 Google/Azure AD/Keycloak 时返工前端路由与 `@repo/auth` 会话模型。

## Decision

### 1. 流程与范围

- **目标流程**：OAuth 2.0 Authorization Code + **PKCE**（S256）；OIDC `openid` scope 换取 `id_token` 与用户信息。
- **首期范围**：saas-web / apps/admin 登录页；成功回调后仍签发现有 JWT access/refresh（与 password 登录同形 `LoginResponse`）。
- **不在骨架期**：真实 redirect、token exchange、用户绑定/Provisioning、租户选择 UI。

### 2. 配置（Phase 1）

| 键 | 默认 | 含义 |
| --- | --- | --- |
| `saas.auth.oauth2.enabled` | `false` | 全局开关；须为 `true` 且至少一个 provider 配齐 `issuer-uri` + `client-id` 才视为「已配置」 |
| `saas.auth.oauth2.providers[].id` | — | 稳定标识（如 `google`、`azure`） |
| `saas.auth.oauth2.providers[].display-name` | — | 登录按钮文案 |
| `saas.auth.oauth2.providers[].issuer-uri` | — | OIDC Issuer（发现文档） |
| `saas.auth.oauth2.providers[].client-id` | — | 公开 client id |
| `saas.auth.oauth2.providers[].client-secret` | — | **仅环境变量/密钥管理**；不得出现在 flags API |
| `saas.auth.oauth2.providers[].scopes` | `openid,profile,email` | 授权 scope 列表 |

回调 URL 约定（Phase 2 实现）：`{web-base-url}/auth/oidc/callback/{providerId}` 与 `{admin-base-url}/auth/oidc/callback/{providerId}`。

### 3. 骨架 API（Phase 1 — 本期）

| 方法 | 路径 | 鉴权 | 行为 |
| --- | --- | --- | --- |
| GET | `/v1/auth/oidc/providers` | 公开 | `enabled`、`authorizationCodeFlowAvailable`（骨架期恒 `false`）、已配置 provider 摘要（id + displayName） |

`GET /v1/admin/system/flags` 增加 `oidc` 段：`enabled`、`authorizationCodeFlowAvailable`、`configuredProviderCount`。

### 4. 后续迭代（Phase 2 — 明确不做于骨架）

| 能力 | 说明 |
| --- | --- |
| `GET /v1/auth/oidc/{providerId}/authorize` | 302 至 IdP；PKCE state/nonce 存 Redis |
| `POST /v1/auth/oidc/{providerId}/callback` | code 换 token；邮箱映射/绑定 `sys_user` |
| 账号链接 | 同邮箱自动关联 vs 显式 bind 表 |
| Admin MFA 与 OIDC | 平台管理员 OIDC 登录后是否仍须 TOTP step-up |
| `@repo/auth` | `loginWithOidc(providerId)` 与 callback route |

### 5. 安全

- Client secret 永不通过 REST 暴露；Swagger 标注 provider 为配置项。
- PKCE 必选；state 一次性；callback 仅允许配置的 redirect URI。
- 骨架期无写操作与 redirect，无新增审计 action。

## Consequences

### 正面

- 登录页与 Admin 系统页可展示 IdP 策略阶段；联调契约稳定。
- Phase 2 可在 `enabled=true` 下逐 provider 上线。

### 负面

- 骨架期 `authorizationCodeFlowAvailable=false`，按钮不可用。
- Phase 2 需 Redis session、用户绑定迁移与 E2E，工作量独立估算。

## References

- [0008-platform-admin-mfa.md](./0008-platform-admin-mfa.md)
- [auth-rbac.md](../architecture/auth-rbac.md)
- [platform-foundation-backlog.md](../architecture/supplements/platform-foundation-backlog.md) FND-07f
