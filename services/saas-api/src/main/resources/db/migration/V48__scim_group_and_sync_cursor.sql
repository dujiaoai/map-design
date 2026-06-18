-- Phase 12-2: SCIM Groups 与增量 sync 游标。
CREATE TABLE scim_group (
    id          UUID PRIMARY KEY,
    tenant_id   UUID         NOT NULL,
    external_id VARCHAR(128) NOT NULL,
    display_name VARCHAR(256) NOT NULL,
    role_code   VARCHAR(64),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_scim_group_tenant_external ON scim_group (tenant_id, external_id);

CREATE TABLE scim_group_member (
    group_id    UUID NOT NULL,
    user_id     UUID NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE scim_sync_cursor (
    tenant_id       UUID PRIMARY KEY,
    last_sync_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
