-- Phase 10-2: 租户 SAML 连接配置骨架（调研，未启用完整流）。
CREATE TABLE tenant_saml_config (
    tenant_id       UUID PRIMARY KEY,
    entity_id       VARCHAR(512),
    sso_url         VARCHAR(1024),
    certificate_pem TEXT,
    enabled         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
