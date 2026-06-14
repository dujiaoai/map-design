-- Sprint F-4: platform admin recharge refund permission.
INSERT INTO sys_permission (id, code, name, description, scope, module_id, is_system)
SELECT '10000000-0000-0000-0000-000000000014', 'admin:billing:refund', '充值退款', '平台对已支付充值订单发起原路退款', 'platform',
       '20000000-0000-0000-0000-000000000007', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sys_permission WHERE code = 'admin:billing:refund');

INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM sys_permission p
WHERE p.code = 'admin:billing:refund'
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000001' AND rp.permission_id = p.id
  );
