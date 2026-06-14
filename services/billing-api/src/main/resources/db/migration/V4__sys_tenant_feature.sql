-- Read-only mirror for billing-api tenant feature checks (canonical DDL in saas-api V4).
CREATE TABLE IF NOT EXISTS sys_tenant_feature (
    tenant_id UUID NOT NULL,
    feature_code VARCHAR(128) NOT NULL,
    PRIMARY KEY (tenant_id, feature_code)
);

CREATE INDEX IF NOT EXISTS idx_sys_tenant_feature_tenant ON sys_tenant_feature (tenant_id);
