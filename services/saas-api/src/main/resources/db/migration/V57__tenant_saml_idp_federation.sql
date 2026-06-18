-- Phase 15-1: 租户 SAML 多 IdP 联邦。
CREATE TABLE tenant_saml_idp_federation (
    id              UUID PRIMARY KEY,
    tenant_id       UUID         NOT NULL,
    idp_entity_id   VARCHAR(512) NOT NULL,
    sso_url         VARCHAR(1024) NOT NULL,
    certificate_pem TEXT,
    priority        INT          NOT NULL DEFAULT 0,
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenant_saml_idp_federation_tenant ON tenant_saml_idp_federation (tenant_id, priority);
