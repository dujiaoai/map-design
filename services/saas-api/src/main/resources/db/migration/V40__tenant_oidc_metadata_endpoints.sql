-- Phase 9-1: 租户 OIDC IdP metadata 导入缓存端点。
ALTER TABLE tenant_oidc_config ADD COLUMN authorization_endpoint VARCHAR(512);
ALTER TABLE tenant_oidc_config ADD COLUMN token_endpoint VARCHAR(512);
ALTER TABLE tenant_oidc_config ADD COLUMN userinfo_endpoint VARCHAR(512);
ALTER TABLE tenant_oidc_config ADD COLUMN metadata_imported_at TIMESTAMP WITH TIME ZONE;
