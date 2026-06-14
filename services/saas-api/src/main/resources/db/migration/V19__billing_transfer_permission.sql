-- Sprint F-5: tenant admin wallet transfer permission.
INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000013', 'billing:transfer:create', '积分划拨', '租户管理员向成员划拨积分', 'tenant',
       '20000000-0000-0000-0000-000000000006', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'billing:transfer:create');

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', p.id
FROM sys_permission p
WHERE p.code = 'billing:transfer:create'
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000002' AND rp.permission_id = p.id
  );
