-- Phase 11-1: 租户 SAML SP ACS URL。
ALTER TABLE tenant_saml_config ADD COLUMN acs_url VARCHAR(1024);
