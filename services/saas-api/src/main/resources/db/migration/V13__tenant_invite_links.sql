CREATE TABLE sys_tenant_invite_link (
    id          UUID PRIMARY KEY,
    tenant_id   UUID         NOT NULL,
    token_hash  VARCHAR(64)  NOT NULL,
    role_code   VARCHAR(32)  NOT NULL DEFAULT 'MEMBER',
    label       VARCHAR(128),
    max_uses    INT,
    use_count   INT          NOT NULL DEFAULT 0,
    expires_at  TIMESTAMP WITH TIME ZONE,
    revoked_at  TIMESTAMP WITH TIME ZONE,
    created_by  UUID,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant_invite_link_tenant FOREIGN KEY (tenant_id) REFERENCES sys_tenant (id)
);

CREATE UNIQUE INDEX idx_tenant_invite_link_token ON sys_tenant_invite_link (token_hash);
CREATE INDEX idx_tenant_invite_link_tenant ON sys_tenant_invite_link (tenant_id, created_at DESC);
