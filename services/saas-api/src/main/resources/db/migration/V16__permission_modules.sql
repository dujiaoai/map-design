-- Sprint D+ P3: permission modules + custom permission catalog.
CREATE TABLE sys_permission_module (
    id          UUID         PRIMARY KEY,
    code        VARCHAR(64)  NOT NULL,
    name        VARCHAR(128) NOT NULL,
    description VARCHAR(255),
    scope       VARCHAR(32)  NOT NULL DEFAULT 'workspace',
    is_system   BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order  INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_sys_permission_module_code UNIQUE (code),
    CONSTRAINT chk_sys_permission_module_scope CHECK (scope IN ('platform', 'tenant', 'workspace'))
);

CREATE INDEX idx_sys_permission_module_scope ON sys_permission_module (scope);

ALTER TABLE sys_permission ADD COLUMN module_id UUID;
ALTER TABLE sys_permission ADD COLUMN is_system BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE sys_permission
    ADD CONSTRAINT fk_sys_permission_module
        FOREIGN KEY (module_id) REFERENCES sys_permission_module (id);

CREATE INDEX idx_sys_permission_module ON sys_permission (module_id);

-- ---------- seed modules (stable UUIDs) ----------
INSERT INTO sys_permission_module (id, code, name, description, scope, is_system, sort_order)
SELECT '20000000-0000-0000-0000-000000000001', 'admin_tenants', '租户管理', '平台租户运营', 'platform', TRUE, 10
WHERE NOT EXISTS (SELECT 1 FROM sys_permission_module WHERE code = 'admin_tenants');

INSERT INTO sys_permission_module (id, code, name, description, scope, is_system, sort_order)
SELECT '20000000-0000-0000-0000-000000000002', 'admin_users', '用户管理', '平台用户运营', 'platform', TRUE, 20
WHERE NOT EXISTS (SELECT 1 FROM sys_permission_module WHERE code = 'admin_users');

INSERT INTO sys_permission_module (id, code, name, description, scope, is_system, sort_order)
SELECT '20000000-0000-0000-0000-000000000003', 'admin_roles', '角色权限', '平台角色与权限目录', 'platform', TRUE, 30
WHERE NOT EXISTS (SELECT 1 FROM sys_permission_module WHERE code = 'admin_roles');

INSERT INTO sys_permission_module (id, code, name, description, scope, is_system, sort_order)
SELECT '20000000-0000-0000-0000-000000000004', 'admin_members', '成员管理', '租户成员与邀请', 'tenant', TRUE, 40
WHERE NOT EXISTS (SELECT 1 FROM sys_permission_module WHERE code = 'admin_members');

INSERT INTO sys_permission_module (id, code, name, description, scope, is_system, sort_order)
SELECT '20000000-0000-0000-0000-000000000005', 'workspace', '地图工作台', 'SaaS 地图工作台能力', 'workspace', TRUE, 50
WHERE NOT EXISTS (SELECT 1 FROM sys_permission_module WHERE code = 'workspace');

UPDATE sys_permission SET module_id = '20000000-0000-0000-0000-000000000001', is_system = TRUE
WHERE code LIKE 'admin:tenants:%' AND module_id IS NULL;

UPDATE sys_permission SET module_id = '20000000-0000-0000-0000-000000000002', is_system = TRUE
WHERE code LIKE 'admin:users:%' AND module_id IS NULL;

UPDATE sys_permission SET module_id = '20000000-0000-0000-0000-000000000003', is_system = TRUE
WHERE code LIKE 'admin:roles:%' AND module_id IS NULL;

UPDATE sys_permission SET module_id = '20000000-0000-0000-0000-000000000004', is_system = TRUE
WHERE code LIKE 'admin:members:%' AND module_id IS NULL;

UPDATE sys_permission SET module_id = '20000000-0000-0000-0000-000000000005', is_system = TRUE
WHERE code LIKE 'workspace:%' AND module_id IS NULL;
