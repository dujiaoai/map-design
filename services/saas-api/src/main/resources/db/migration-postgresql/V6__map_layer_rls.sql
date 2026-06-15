-- PostgreSQL-only: row-level security for map_layer (FND-04a).
-- Same session variables as V5__rls.sql (TenantRlsDataSource).

ALTER TABLE map_layer ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_layer FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS map_layer_tenant_access ON map_layer;

CREATE POLICY map_layer_tenant_access ON map_layer
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
