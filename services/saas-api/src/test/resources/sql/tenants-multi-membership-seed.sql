-- Extra tenant membership for the same email (multi-tenant TeamSwitcher scenario).
DELETE FROM sys_user_role WHERE user_id = '22222222-2222-2222-2222-222222222202';
DELETE FROM sys_user WHERE id = '22222222-2222-2222-2222-222222222202';
DELETE FROM sys_tenant_feature WHERE tenant_id = '11111111-1111-1111-1111-111111111102';
DELETE FROM sys_tenant WHERE id = '11111111-1111-1111-1111-111111111102';

INSERT INTO sys_tenant (id, name, slug, plan)
VALUES (
  '11111111-1111-1111-1111-111111111102',
  'Second Tenant',
  'second',
  'pro'
);

INSERT INTO sys_user (id, tenant_id, email, password_hash, display_name, status)
VALUES (
  '22222222-2222-2222-2222-222222222202',
  '11111111-1111-1111-1111-111111111102',
  'admin@test.local',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'Test Admin Second',
  'active'
);

INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222202',
  '00000000-0000-0000-0000-000000000003'
);
