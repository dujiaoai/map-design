-- Test fixture: PLATFORM_ADMIN retains tenants:read but loses audit permissions.
DELETE FROM sys_role_permission
WHERE role_id = '00000000-0000-0000-0000-000000000001'
  AND permission_id IN (
    SELECT id FROM sys_permission WHERE code IN ('admin:audit:read', 'admin:audit:export')
  );
