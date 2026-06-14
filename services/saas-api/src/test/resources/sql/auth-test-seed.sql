DELETE FROM sys_role_permission
WHERE role_id IN (
  SELECT id FROM sys_role
  WHERE tenant_id NOT IN ('00000000-0000-0000-0000-000000000000')
);
DELETE FROM sys_user_role
WHERE role_id IN (
  SELECT id FROM sys_role
  WHERE tenant_id NOT IN ('00000000-0000-0000-0000-000000000000')
);
DELETE FROM sys_role
WHERE tenant_id NOT IN ('00000000-0000-0000-0000-000000000000');

DELETE FROM sys_user_role
WHERE user_id IN (
  SELECT id FROM sys_user WHERE tenant_id IN (
    '11111111-1111-1111-1111-111111111101',
    '99999999-9999-9999-9999-999999999901',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01'
  )
);
DELETE FROM sys_email_verification_token
WHERE user_id IN (
  SELECT id FROM sys_user WHERE tenant_id IN (
    '11111111-1111-1111-1111-111111111101',
    '99999999-9999-9999-9999-999999999901',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01'
  )
);
DELETE FROM sys_email_outbox
WHERE tenant_id IN (
  '11111111-1111-1111-1111-111111111101',
  '99999999-9999-9999-9999-999999999901',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01'
);
DELETE FROM sys_user WHERE tenant_id IN (
  '11111111-1111-1111-1111-111111111101',
  '99999999-9999-9999-9999-999999999901',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01'
);
DELETE FROM sys_tenant_feature WHERE tenant_id IN (
  '11111111-1111-1111-1111-111111111101',
  '99999999-9999-9999-9999-999999999901',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01'
);
DELETE FROM map_layer WHERE tenant_id IN (
  '11111111-1111-1111-1111-111111111101',
  '99999999-9999-9999-9999-999999999901',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  '11111111-1111-1111-1111-111111111102'
);
DELETE FROM sys_tenant_invite_link WHERE tenant_id IN (
  '11111111-1111-1111-1111-111111111101',
  '99999999-9999-9999-9999-999999999901',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01'
);
DELETE FROM sys_tenant WHERE id IN (
  '11111111-1111-1111-1111-111111111101',
  '99999999-9999-9999-9999-999999999901',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01'
);

INSERT INTO sys_tenant (id, name, slug, plan)
VALUES (
  '11111111-1111-1111-1111-111111111101',
  'Test Tenant',
  'test',
  'free'
);

INSERT INTO sys_user (id, tenant_id, email, password_hash, display_name, status)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111101',
  'admin@test.local',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'Test Admin',
  'active'
);

INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0000-000000000002'
);

INSERT INTO sys_user (id, tenant_id, email, password_hash, display_name, status)
VALUES (
  '22222222-2222-2222-2222-222222222203',
  '11111111-1111-1111-1111-111111111101',
  'platform@test.local',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'Platform Admin',
  'active'
);

INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222203',
  '00000000-0000-0000-0000-000000000001'
);

-- Second tenant for cross-tenant admin member tests
INSERT INTO sys_tenant (id, name, slug, plan)
VALUES (
  '99999999-9999-9999-9999-999999999901',
  'Other Tenant',
  'other',
  'free'
);

INSERT INTO sys_user (id, tenant_id, email, password_hash, display_name, status)
VALUES (
  '22222222-2222-2222-2222-222222222299',
  '99999999-9999-9999-9999-999999999901',
  'other@test.local',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'Other Member',
  'active'
);

INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222299',
  '00000000-0000-0000-0000-000000000003'
);

-- Disabled member on active tenant (login semantics tests)
INSERT INTO sys_user (id, tenant_id, email, password_hash, display_name, status)
VALUES (
  '22222222-2222-2222-2222-222222222204',
  '11111111-1111-1111-1111-111111111101',
  'disabled@test.local',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'Disabled Member',
  'disabled'
);

INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222204',
  '00000000-0000-0000-0000-000000000003'
);

-- Suspended tenant with active user (tenant gate tests)
INSERT INTO sys_tenant (id, name, slug, plan, status)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  'Suspended Tenant',
  'suspended',
  'free',
  'suspended'
);

INSERT INTO sys_user (id, tenant_id, email, password_hash, display_name, status)
VALUES (
  '22222222-2222-2222-2222-222222222205',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa01',
  'suspended-tenant@test.local',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'Suspended Tenant User',
  'active'
);

INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222205',
  '00000000-0000-0000-0000-000000000003'
);
