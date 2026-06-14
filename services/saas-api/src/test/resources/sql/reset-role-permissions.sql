-- Reset role-permission bindings to Flyway V6 seed (test isolation for admin API).
DELETE FROM sys_role_permission;

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM sys_permission p
WHERE p.scope = 'platform';

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', p.id
FROM sys_permission p
WHERE p.scope IN ('tenant', 'workspace');

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', p.id
FROM sys_permission p
WHERE p.code IN (
  'workspace:use',
  'workspace:map:read',
  'workspace:map:write',
  'billing:wallet:read',
  'billing:ledger:read',
  'billing:recharge:create'
);

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', p.id
FROM sys_permission p
WHERE p.code IN (
  'workspace:use',
  'workspace:map:read',
  'billing:wallet:read',
  'billing:ledger:read'
);
