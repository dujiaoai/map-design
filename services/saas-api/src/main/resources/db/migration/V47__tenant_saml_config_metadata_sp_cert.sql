-- Phase 12-1: 租户 SAML metadata 导入与 SP 证书轮换。
ALTER TABLE tenant_saml_config ADD COLUMN metadata_url VARCHAR(1024);
ALTER TABLE tenant_saml_config ADD COLUMN sp_certificate_pem TEXT;
ALTER TABLE tenant_saml_config ADD COLUMN sp_certificate_expires_at TIMESTAMP WITH TIME ZONE;
