-- Phase 16-1: 租户 SAML 断连演练日志。
CREATE TABLE tenant_saml_disconnect_drill_log (
    id             UUID PRIMARY KEY,
    tenant_id      UUID         NOT NULL,
    idp_entity_id  VARCHAR(512) NOT NULL,
    result         VARCHAR(32)  NOT NULL,
    latency_ms     BIGINT       NOT NULL DEFAULT 0,
    drilled_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenant_saml_disconnect_drill_tenant ON tenant_saml_disconnect_drill_log (tenant_id, drilled_at DESC);
