-- Platform admin tenant impersonation (ADR-0007).
INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000017', 'admin:impersonate', '租户代操作', '以目标租户上下文代操作并审计', 'platform',
       '20000000-0000-0000-0000-000000000001', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:impersonate');

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM sys_permission p
WHERE p.code = 'admin:impersonate'
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000001' AND rp.permission_id = p.id
  );
