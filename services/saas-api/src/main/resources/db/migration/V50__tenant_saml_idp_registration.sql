-- Phase 13-1: 租户 SAML IdP 自助注册。
CREATE TABLE tenant_saml_idp_registration (
    id                      UUID PRIMARY KEY,
    tenant_id               UUID         NOT NULL,
    registration_token_hash VARCHAR(128) NOT NULL,
    idp_entity_id           VARCHAR(1024),
    status                  VARCHAR(32)  NOT NULL DEFAULT 'pending',
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenant_saml_idp_reg_tenant_status ON tenant_saml_idp_registration (tenant_id, status);
