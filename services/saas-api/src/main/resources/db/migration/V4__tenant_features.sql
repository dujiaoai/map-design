-- Per-tenant capability codes (align with frontend MockModuleMeta.tenantFeature).
CREATE TABLE sys_tenant_feature (
    tenant_id     UUID         NOT NULL,
    feature_code  VARCHAR(128) NOT NULL,
    PRIMARY KEY (tenant_id, feature_code),
    CONSTRAINT fk_sys_tenant_feature_tenant FOREIGN KEY (tenant_id) REFERENCES sys_tenant (id)
);

CREATE INDEX idx_sys_tenant_feature_tenant ON sys_tenant_feature (tenant_id);
