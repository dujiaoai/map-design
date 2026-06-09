-- Tenant capability codes for features API tests.
DELETE FROM sys_tenant_feature
WHERE tenant_id IN (
  '11111111-1111-1111-1111-111111111101',
  '11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111199'
);
DELETE FROM sys_tenant WHERE id = '11111111-1111-1111-1111-111111111199';

INSERT INTO sys_tenant_feature (tenant_id, feature_code) VALUES
  ('11111111-1111-1111-1111-111111111101', 'custom.highway-alert'),
  ('11111111-1111-1111-1111-111111111101', 'custom.live-share');

INSERT INTO sys_tenant_feature (tenant_id, feature_code) VALUES
  ('11111111-1111-1111-1111-111111111102', 'custom.live-share');

-- Tenant without membership for access-denied scenario.
INSERT INTO sys_tenant (id, name, slug, plan)
VALUES (
  '11111111-1111-1111-1111-111111111199',
  'Orphan Tenant',
  'orphan',
  'free'
);

INSERT INTO sys_tenant_feature (tenant_id, feature_code) VALUES
  ('11111111-1111-1111-1111-111111111199', 'custom.orphan');
