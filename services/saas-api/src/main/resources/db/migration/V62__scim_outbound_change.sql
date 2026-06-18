-- Phase 16-2: SCIM 出站变更队列。
CREATE TABLE scim_outbound_change (
    id            UUID PRIMARY KEY,
    tenant_id     UUID         NOT NULL,
    resource_type VARCHAR(64)  NOT NULL,
    external_id   VARCHAR(256) NOT NULL,
    operation     VARCHAR(32)  NOT NULL,
    payload       TEXT,
    status        VARCHAR(32)  NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scim_outbound_change_tenant ON scim_outbound_change (tenant_id, status, created_at);
