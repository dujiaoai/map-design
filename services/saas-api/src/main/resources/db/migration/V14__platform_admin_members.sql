-- Sprint D+ P0: PLATFORM_ADMIN can manage tenant members without ROLE_* fallback in JWT.
INSERT INTO sys_role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM sys_permission p
WHERE p.code IN ('admin:members:read', 'admin:members:write')
  AND NOT EXISTS (
    SELECT 1 FROM sys_role_permission rp
    WHERE rp.role_id = '00000000-0000-0000-0000-000000000001' AND rp.permission_id = p.id
  );
