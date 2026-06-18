-- Phase 10-5: SCIM Directory Sync PoC — 租户 provisioning token 骨架。
CREATE TABLE scim_provisioning_token (
    tenant_id   UUID PRIMARY KEY,
    token_hash  VARCHAR(64)  NOT NULL,
    enabled     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_scim_provisioning_token_hash ON scim_provisioning_token (token_hash);
