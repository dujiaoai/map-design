-- Manual dev seed: demo tenant + users + role bindings.
-- NOT a Flyway migration — run only in local PostgreSQL.
--
-- Usage:
--   docker exec -i services-postgres-1 psql -U saas -d saas < services/saas-api/scripts/seed-demo-dev.sql
--
-- Demo credentials (for /v1/auth/login):
--   admin@demo.local / password / demo — PLATFORM_ADMIN + TENANT_ADMIN（平台运营联调）
--   tenantadmin@demo.local / password / demo — 仅 TENANT_ADMIN（租户管理员 /members）
--   member@demo.local / password / demo — MEMBER（无 admin 权限）

BEGIN;

-- Demo tenant
INSERT INTO sys_tenant (id, name, slug, plan)
VALUES (
  '11111111-1111-1111-1111-111111111101',
  'Demo 租户',
  'demo',
  'free'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, slug = EXCLUDED.slug, plan = EXCLUDED.plan;

-- BCrypt hash for plaintext: password
-- ($2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG)
INSERT INTO sys_user (id, tenant_id, email, password_hash, display_name, status)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111101',
  'admin@demo.local',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'Demo Admin',
  'active'
)
ON CONFLICT (id) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    status = EXCLUDED.status;

INSERT INTO sys_user (id, tenant_id, email, password_hash, display_name, status)
VALUES (
  '22222222-2222-2222-2222-222222222202',
  '11111111-1111-1111-1111-111111111101',
  'member@demo.local',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'Demo Member',
  'active'
)
ON CONFLICT (id) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    status = EXCLUDED.status;

-- Role IDs from V3__seed_roles.sql
INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0000-000000000002'  -- TENANT_ADMIN
)
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '00000000-0000-0000-0000-000000000001'  -- PLATFORM_ADMIN（/v1/admin/* 联调）
)
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO sys_user (id, tenant_id, email, password_hash, display_name, status)
VALUES (
  '22222222-2222-2222-2222-222222222203',
  '11111111-1111-1111-1111-111111111101',
  'tenantadmin@demo.local',
  '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
  'Demo Tenant Admin',
  'active'
)
ON CONFLICT (id) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    status = EXCLUDED.status;

INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222203',
  '00000000-0000-0000-0000-000000000002'  -- TENANT_ADMIN only
)
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO sys_user_role (user_id, role_id)
VALUES (
  '22222222-2222-2222-2222-222222222202',
  '00000000-0000-0000-0000-000000000003'  -- MEMBER
)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Capability codes (align with mock-nav-items tenantFeature)
DELETE FROM sys_tenant_feature
WHERE tenant_id = '11111111-1111-1111-1111-111111111101';

INSERT INTO sys_tenant_feature (tenant_id, feature_code) VALUES
  ('11111111-1111-1111-1111-111111111101', 'custom.highway-alert'),
  ('11111111-1111-1111-1111-111111111101', 'custom.live-share');

COMMIT;

-- ---------- verify ----------
SELECT t.id, t.name, t.slug, u.email, u.display_name, r.code AS role
FROM sys_tenant t
JOIN sys_user u ON u.tenant_id = t.id
LEFT JOIN sys_user_role ur ON ur.user_id = u.id
LEFT JOIN sys_role r ON r.id = ur.role_id
WHERE t.slug = 'demo'
ORDER BY u.email;
