CREATE TABLE sys_admin_audit_log (
    id                UUID PRIMARY KEY,
    actor_user_id     UUID         NOT NULL,
    actor_email       VARCHAR(255) NOT NULL,
    actor_tenant_id   UUID,
    action            VARCHAR(64)  NOT NULL,
    resource_type     VARCHAR(64)  NOT NULL,
    resource_id       VARCHAR(64),
    target_tenant_id  UUID,
    cross_tenant      BOOLEAN      NOT NULL DEFAULT FALSE,
    detail            VARCHAR(512),
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sys_admin_audit_log_created ON sys_admin_audit_log (created_at DESC);
