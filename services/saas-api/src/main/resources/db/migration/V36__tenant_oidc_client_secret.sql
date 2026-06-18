-- Phase 8-1: 租户 OIDC client_secret 与 scopes（完整授权流）。
ALTER TABLE tenant_oidc_config
    ADD COLUMN client_secret VARCHAR(512),
    ADD COLUMN scopes       VARCHAR(256);
