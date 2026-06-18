-- Phase 14-1: 租户 SAML IdP metadata 自动同步与证书到期。
ALTER TABLE tenant_saml_config ADD COLUMN metadata_sync_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tenant_saml_config ADD COLUMN last_metadata_sync_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tenant_saml_config ADD COLUMN idp_cert_expires_at TIMESTAMP WITH TIME ZONE;
