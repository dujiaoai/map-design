-- Sprint F-1: billing permission catalog + role bindings (saas-api).
INSERT INTO sys_permission_module (id, code, name, description, scope, is_system, sort_order)
SELECT '20000000-0000-0000-0000-000000000006', 'billing', '积分计费', '用户钱包、充值与消费', 'tenant', TRUE, 60
WHERE NOT EXISTS (SELECT 1 FROM sys_permission_module WHERE code = 'billing');

INSERT INTO sys_permission_module (id, code, name, description, scope, is_system, sort_order)
SELECT '20000000-0000-0000-0000-000000000007', 'admin_billing', '平台计费', '平台账单与 SKU 管理', 'platform', TRUE, 35
WHERE NOT EXISTS (SELECT 1 FROM sys_permission_module WHERE code = 'admin_billing');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-00000000000c', 'billing:wallet:read', '查看钱包', '读本人钱包与价目', 'tenant',
       '20000000-0000-0000-0000-000000000006', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'billing:wallet:read');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-00000000000d', 'billing:ledger:read', '查看流水', '读本人积分流水', 'tenant',
       '20000000-0000-0000-0000-000000000006', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'billing:ledger:read');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-00000000000e', 'billing:recharge:create', '自助充值', '创建充值订单', 'tenant',
       '20000000-0000-0000-0000-000000000006', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'billing:recharge:create');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-00000000000f', 'billing:usage:read', '团队用量', '租户成员消费汇总', 'tenant',
       '20000000-0000-0000-0000-000000000006', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'billing:usage:read');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000010', 'admin:billing:read', '平台账单只读', '平台账单与钱包列表', 'platform',
       '20000000-0000-0000-0000-000000000007', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:billing:read');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000011', 'admin:billing:adjust', '平台调账', '平台人工调账', 'platform',
       '20000000-0000-0000-0000-000000000007', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:billing:adjust');

INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000012', 'admin:billing:packages:write', 'SKU 管理', '充值套餐 CRUD', 'platform',
       '20000000-0000-0000-0000-000000000007', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:billing:packages:write');

-- PLATFORM_ADMIN — platform billing permissions
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM sys_permission p
WHERE p.code LIKE 'admin:billing:%'
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000001' AND rp.permission_id = p.id
  );

-- TENANT_ADMIN — all tenant billing permissions
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', p.id
FROM sys_permission p
WHERE p.code LIKE 'billing:%'
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000002' AND rp.permission_id = p.id
  );

-- MEMBER — wallet/ledger/recharge (not team usage)
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', p.id
FROM sys_permission p
WHERE p.code IN ('billing:wallet:read', 'billing:ledger:read', 'billing:recharge:create')
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000003' AND rp.permission_id = p.id
  );

-- VIEWER — read-only wallet/ledger (no recharge)
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', p.id
FROM sys_permission p
WHERE p.code IN ('billing:wallet:read', 'billing:ledger:read')
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000004' AND rp.permission_id = p.id
  );
