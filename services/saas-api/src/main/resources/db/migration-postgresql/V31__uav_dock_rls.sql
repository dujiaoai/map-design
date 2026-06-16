-- PostgreSQL-only: row-level security for uav_dock (E-03).

ALTER TABLE uav_dock ENABLE ROW LEVEL SECURITY;
ALTER TABLE uav_dock FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS uav_dock_tenant_access ON uav_dock;

CREATE POLICY uav_dock_tenant_access ON uav_dock
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
