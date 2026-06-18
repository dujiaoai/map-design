-- Phase 11-2: SCIM external_id 与用户映射。
CREATE TABLE scim_user_external_id (
    tenant_id    UUID         NOT NULL,
    external_id  VARCHAR(256) NOT NULL,
    user_id      UUID         NOT NULL,
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, external_id)
);

CREATE INDEX idx_scim_user_external_id_user ON scim_user_external_id (tenant_id, user_id);
