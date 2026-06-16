-- Audit log read/export permissions (decoupled from admin:tenants:read).
INSERT INTO sys_permission_module (id, code, name, description, scope, is_system, sort_order)
SELECT '20000000-0000-0000-0000-000000000008', 'admin_audit', '审计日志', '平台操作审计查询与导出', 'platform', TRUE, 45
WHERE NOT EXISTS (SELECT 1 FROM sys_permission_module WHERE code = 'admin_audit');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000015', 'admin:audit:read', '查看审计日志', '平台审计日志列表', 'platform',
       '20000000-0000-0000-0000-000000000008', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:audit:read');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000016', 'admin:audit:export', '导出审计日志', '导出审计日志 CSV', 'platform',
       '20000000-0000-0000-0000-000000000008', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:audit:export');

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM sys_permission p
WHERE p.code IN ('admin:audit:read', 'admin:audit:export')
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000001' AND rp.permission_id = p.id
  );
