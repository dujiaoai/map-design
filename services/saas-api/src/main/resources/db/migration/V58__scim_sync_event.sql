-- Phase 15-2: SCIM 事件驱动同步与冲突配置。
CREATE TABLE scim_sync_event (
    id          UUID PRIMARY KEY,
    tenant_id   UUID         NOT NULL,
    event_type  VARCHAR(64)  NOT NULL,
    external_id VARCHAR(512),
    payload     TEXT,
    status      VARCHAR(32)  NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_scim_sync_event_pending ON scim_sync_event (tenant_id, status, created_at);

CREATE TABLE tenant_scim_sync_config (
    tenant_id          UUID PRIMARY KEY,
    conflict_strategy  VARCHAR(32) NOT NULL DEFAULT 'last_write_wins',
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
