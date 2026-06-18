# ADR-0011: 租户 SSO OAuth 授权流

## 状态

Accepted · 2026-06

## 背景

Phase 7 仅提供租户 SSO 探测 API；Phase 8 需完整 OAuth 授权码 + PKCE 流。

## 决策

1. **独立端点**：`GET/POST /v1/auth/tenants/{slug}/sso/*`，不复用平台 `/v1/auth/oidc/{providerId}`。
2. **Provider 命名空间**：`tenant:{slug}` 写入 `user_oauth_bind`，避免与平台 IdP 冲突。
3. **回调 URI**：`{webBaseUrl}/auth/tenant-sso/callback/{slug}`（saas-web 路由）。
4. **配置**：`tenant_oidc_config` 存 `client_secret`（Admin PATCH，响应掩码）；`loginAvailable` 要求 secret 已配置。
5. **Session**：复用 `OidcAuthorizationSessionStore`（Redis / 内存 test）。

## 后果

- Admin 须配置 client secret 后租户 SSO 按钮才可用。
- 生产需 HTTPS 回调与 secret 轮换流程（Phase 9）。
