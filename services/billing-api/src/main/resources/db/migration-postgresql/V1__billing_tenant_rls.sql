-- PostgreSQL-only: row-level security for billing tenant-scoped tables (ADR-0004).
-- Session variables set by TenantRlsDataSource:
--   app.tenant_id          — current JWT tenant UUID
--   app.bypass_tenant_rls  — 'on' for trusted cross-tenant paths (internal, admin, jobs)

CREATE OR REPLACE FUNCTION billing_tenant_rls_predicate(tenant_col UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(current_setting('app.bypass_tenant_rls', true), '') = 'on'
    OR (
      NULLIF(current_setting('app.tenant_id', true), '') IS NOT NULL
      AND tenant_col = NULLIF(current_setting('app.tenant_id', true), '')::uuid
    );
$$;

DO $rls$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'billing_wallet',
    'billing_ledger',
    'billing_recharge_order',
    'billing_consumption_record',
    'billing_signup_bonus_pending',
    'billing_notification',
    'billing_invoice_request',
    'billing_coupon_redemption',
    'billing_wire_transfer_request',
    'sys_tenant_feature'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', tbl || '_tenant_access', tbl);
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR ALL USING (billing_tenant_rls_predicate(tenant_id)) WITH CHECK (billing_tenant_rls_predicate(tenant_id))',
        tbl || '_tenant_access',
        tbl
      );
    END IF;
  END LOOP;
END $rls$;

-- sys_user mirror: skip when saas-api V5 policy already exists (shared PG).
DO $sys_user$
BEGIN
  IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'sys_user'
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'sys_user'
        AND policyname = 'sys_user_tenant_access'
    ) THEN
    ALTER TABLE sys_user ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sys_user FORCE ROW LEVEL SECURITY;
    CREATE POLICY sys_user_tenant_access ON sys_user
      FOR ALL
      USING (billing_tenant_rls_predicate(tenant_id))
      WITH CHECK (billing_tenant_rls_predicate(tenant_id));
  END IF;
END $sys_user$;
