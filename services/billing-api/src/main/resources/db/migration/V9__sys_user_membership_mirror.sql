-- Read-only membership mirror for billing dedicated DB (canonical DDL in saas-api V2 sys_user).
-- Populated by deploy billing-db-sync job or future saas-api → billing CDC.
CREATE TABLE IF NOT EXISTS sys_user (
    id         UUID PRIMARY KEY,
    tenant_id  UUID NOT NULL,
    email      VARCHAR(255),
    status     VARCHAR(32) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sys_user_tenant ON sys_user (tenant_id);
