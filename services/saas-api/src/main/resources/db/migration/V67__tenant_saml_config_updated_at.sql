-- Align tenant_saml_config with TenantSamlConfig entity (updated_at used by admin SAML APIs).
ALTER TABLE tenant_saml_config
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE tenant_saml_config
SET updated_at = created_at
WHERE updated_at IS NULL;
