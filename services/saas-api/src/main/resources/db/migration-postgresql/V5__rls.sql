-- PostgreSQL-only: row-level security for sys_user (ADR-0004 / Sprint B-05).
-- Session variables set by TenantRlsDataSource:
--   app.tenant_id          — current JWT tenant UUID
--   app.bypass_tenant_rls  — 'on' for trusted cross-tenant reads (login, membership)

ALTER TABLE sys_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_user FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sys_user_tenant_access ON sys_user;

CREATE POLICY sys_user_tenant_access ON sys_user
  FOR ALL
  USING (
    COALESCE(current_setting('app.bypass_tenant_rls', true), '') = 'on'
    OR (
      NULLIF(current_setting('app.tenant_id', true), '') IS NOT NULL
      AND tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    )
  )
  WITH CHECK (
    COALESCE(current_setting('app.bypass_tenant_rls', true), '') = 'on'
    OR (
      NULLIF(current_setting('app.tenant_id', true), '') IS NOT NULL
      AND tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    )
  );
