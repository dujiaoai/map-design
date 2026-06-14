-- Personal workspace tenant kind (F-0 billing / personal signup).
ALTER TABLE sys_tenant
    ADD COLUMN tenant_kind VARCHAR(16) NOT NULL DEFAULT 'organization';

ALTER TABLE sys_tenant
    ADD CONSTRAINT chk_sys_tenant_kind CHECK (tenant_kind IN ('organization', 'personal'));

CREATE INDEX idx_sys_tenant_kind ON sys_tenant (tenant_kind);
