-- Sprint D-01: fine-grained permission catalog + role bindings (global, not tenant-scoped).
CREATE TABLE sys_permission (
    id          UUID         PRIMARY KEY,
    code        VARCHAR(128) NOT NULL,
    name        VARCHAR(128) NOT NULL,
    description VARCHAR(255),
    scope       VARCHAR(32)  NOT NULL DEFAULT 'platform',
    CONSTRAINT uq_sys_permission_code UNIQUE (code),
    CONSTRAINT chk_sys_permission_scope CHECK (scope IN ('platform', 'tenant', 'workspace'))
);

CREATE TABLE sys_role_permission (
    role_id       UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_sys_role_permission_role FOREIGN KEY (role_id) REFERENCES sys_role (id),
    CONSTRAINT fk_sys_role_permission_permission FOREIGN KEY (permission_id) REFERENCES sys_permission (id)
);

CREATE INDEX idx_sys_role_permission_role ON sys_role_permission (role_id);
CREATE INDEX idx_sys_role_permission_permission ON sys_role_permission (permission_id);

-- ---------- seed permissions (stable UUIDs) ----------
INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-000000000001', 'admin:tenants:read', 'View tenants', 'Platform tenant list', 'platform'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:tenants:read');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-000000000002', 'admin:tenants:write', 'Manage tenants', 'Platform tenant create/update', 'platform'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:tenants:write');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-000000000003', 'admin:users:read', 'View users', 'Platform user list', 'platform'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:users:read');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-000000000004', 'admin:users:write', 'Manage users', 'Platform user administration', 'platform'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:users:write');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-000000000005', 'admin:roles:read', 'View roles', 'Platform role and permission bindings', 'platform'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:roles:read');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-000000000006', 'admin:roles:write', 'Assign role permissions', 'Platform role permission configuration', 'platform'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:roles:write');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-000000000007', 'admin:members:read', 'View members', 'Tenant member list', 'tenant'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:members:read');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-000000000008', 'admin:members:write', 'Manage members', 'Tenant invite, disable, role assign', 'tenant'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:members:write');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-000000000009', 'workspace:use', 'Use workspace', 'Access map workspace', 'workspace'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'workspace:use');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-00000000000a', 'workspace:map:read', 'View map', 'Read-only map and layers', 'workspace'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'workspace:map:read');

INSERT INTO sys_permission (id, code, name, description, scope)
SELECT '10000000-0000-0000-0000-00000000000b', 'workspace:map:write', 'Edit map', 'Draw, measure, and edit tools', 'workspace'
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'workspace:map:write');

-- PLATFORM_ADMIN — all platform permissions
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM sys_permission p
WHERE p.scope = 'platform'
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000001' AND rp.permission_id = p.id
  );

-- TENANT_ADMIN — tenant + workspace
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', p.id
FROM sys_permission p
WHERE p.scope IN ('tenant', 'workspace')
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000002' AND rp.permission_id = p.id
  );

-- MEMBER — workspace read/write
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', p.id
FROM sys_permission p
WHERE p.code IN ('workspace:use', 'workspace:map:read', 'workspace:map:write')
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000003' AND rp.permission_id = p.id
  );

-- VIEWER — workspace read-only
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', p.id
FROM sys_permission p
WHERE p.code IN ('workspace:use', 'workspace:map:read')
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000004' AND rp.permission_id = p.id
  );
