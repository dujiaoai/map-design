-- Sprint D+ P2: tenant-scoped custom roles (system roles use sentinel tenant_id).
ALTER TABLE sys_role ADD COLUMN tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE sys_role ADD COLUMN name VARCHAR(128) NOT NULL DEFAULT '';
ALTER TABLE sys_role ADD COLUMN description VARCHAR(255);
ALTER TABLE sys_role ADD COLUMN is_system BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE sys_role
SET is_system = TRUE,
    name = CASE code
        WHEN 'PLATFORM_ADMIN' THEN '平台管理员'
        WHEN 'TENANT_ADMIN' THEN '租户管理员'
        WHEN 'MEMBER' THEN '成员'
        WHEN 'VIEWER' THEN '只读查看者'
        ELSE code
    END
WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004'
);

ALTER TABLE sys_role DROP CONSTRAINT uq_sys_role_code;
ALTER TABLE sys_role ADD CONSTRAINT uq_sys_role_tenant_code UNIQUE (tenant_id, code);

CREATE INDEX idx_sys_role_tenant ON sys_role (tenant_id);
