# ADR-0009: OAuth2/OIDC 登录（骨架）

## Status

Accepted（Phase 2 全链路 + 本地联调 runbook 已落地；显式账号绑定仍 Later）

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

回调 URL：`{web-base-url}/auth/oidc/callback/{providerId}`（saas-web ✅）与 `{admin-base-url}/auth/oidc/callback/{providerId}`（Admin ✅）。

### 3. 骨架 API（Phase 1 — 本期）

| 方法 | 路径 | 鉴权 | 行为 |
| --- | --- | --- | --- |
| GET | `/v1/auth/oidc/providers` | 公开 | `enabled`、`authorizationCodeFlowAvailable`、已配置 provider 摘要（id + displayName） |

Phase 1 骨架期 `authorizationCodeFlowAvailable` 恒为 `false`；Phase 2 在 provider 配齐 `client-secret` 且全局 `enabled=true` 时为 `true`。

`GET /v1/admin/system/flags` 增加 `oidc` 段：`enabled`、`authorizationCodeFlowAvailable`、`configuredProviderCount`。

### 4. Phase 2（FND-07g — Admin ✅）

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| `GET /v1/auth/oidc/{providerId}/authorize` | ✅ | 返回 `authorizationUrl` + `state`；PKCE S256；state 存 Redis（test 用 InMemory） |
| `POST /v1/auth/oidc/{providerId}/callback` | ✅ | code 换 token；OIDC 邮箱映射已有 `sys_user`；签发现有 JWT `LoginResponse` |
| Admin MFA 与 OIDC | ✅ | 平台管理员 OIDC 回调后若已绑 TOTP，仍走 `mfaRequired` step-up |
| `@repo/auth` + Admin UI | ✅ | `startOidcAuthorize` / `completeOidcLogin`；登录页 IdP 按钮；`/auth/oidc/callback/:providerId` |
| saas-web UI | ✅ | 同上，`client=web`；登录页 IdP 按钮 + callback；MFA step-up |
| 本地联调 runbook | ✅ | `application-oidc.example.yml` + [oidc-dev-setup.md](../runbooks/oidc-dev-setup.md) |

### 5. 仍 Later

| 能力 | 说明 |
| --- | --- |
| 账号链接 | 同邮箱自动关联 vs 显式 bind 表 |

### 6. 安全

- Client secret 永不通过 REST 暴露；Swagger 标注 provider 为配置项。
- PKCE 必选；state 一次性；callback 仅允许配置的 redirect URI。
- 骨架期无写操作与 redirect，无新增审计 action（Phase 2 callback 写 session/JWT，审计沿用 `auth.login`）。

## Consequences

### 正面

- 登录页与 Admin 系统页可展示 IdP 策略阶段；联调契约稳定。
- Admin 与 saas-web 可在 `enabled=true` 且 provider 配齐 secret 后逐 IdP 上线。

### 负面

- Admin 未配置 IdP 或缺 `client-secret` 时 `authorizationCodeFlowAvailable=false`，登录页不展示 IdP 按钮。
- Phase 2 后续用户 bind 表与真实 IdP E2E 工作量独立估算。

## References

- [0008-platform-admin-mfa.md](./0008-platform-admin-mfa.md)
- [auth-rbac.md](../architecture/auth-rbac.md)
- [platform-foundation-backlog.md](../architecture/supplements/platform-foundation-backlog.md) FND-07f～FND-07i
- [oidc-dev-setup.md](../runbooks/oidc-dev-setup.md)
