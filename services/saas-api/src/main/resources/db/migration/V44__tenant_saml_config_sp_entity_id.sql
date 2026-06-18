-- Phase 11-1: 租户 SAML SP Entity ID。
ALTER TABLE tenant_saml_config ADD COLUMN sp_entity_id VARCHAR(512);
