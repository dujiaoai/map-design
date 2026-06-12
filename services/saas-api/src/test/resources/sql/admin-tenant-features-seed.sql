-- Feature codes for admin tenant features API tests (TEST_TENANT only).
DELETE FROM sys_tenant_feature
WHERE tenant_id = '11111111-1111-1111-1111-111111111101';

INSERT INTO sys_tenant_feature (tenant_id, feature_code) VALUES
  ('11111111-1111-1111-1111-111111111101', 'custom.highway-alert'),
  ('11111111-1111-1111-1111-111111111101', 'custom.live-share');
