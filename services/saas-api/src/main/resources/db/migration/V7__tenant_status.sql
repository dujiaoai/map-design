-- Sprint D-04: tenant enable/disable for platform admin.
ALTER TABLE sys_tenant
    ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'active';

ALTER TABLE sys_tenant
    ADD CONSTRAINT chk_sys_tenant_status CHECK (status IN ('active', 'suspended'));
