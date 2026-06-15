#!/bin/sh
# Copy sys_user + sys_tenant_feature from saas PostgreSQL into billing dedicated DB.
# Used by deploy/docker-compose.billing-db.yml billing-db-sync one-shot service.

set -e

SAAS_HOST="${SAAS_PG_HOST:-postgres}"
SAAS_DB="${SAAS_PG_DB:-saas}"
SAAS_USER="${SAAS_PG_USER:-saas}"
SAAS_PASSWORD="${SAAS_PG_PASSWORD:-saas}"

BILLING_HOST="${BILLING_PG_HOST:-postgres-billing}"
BILLING_DB="${BILLING_PG_DB:-billing}"
BILLING_USER="${BILLING_PG_USER:-billing}"
BILLING_PASSWORD="${BILLING_PG_PASSWORD:-billing}"

MAX_ATTEMPTS="${SYNC_MAX_ATTEMPTS:-30}"
SLEEP_SEC="${SYNC_SLEEP_SEC:-2}"

wait_for_table() {
  host="$1"
  db="$2"
  user="$3"
  password="$4"
  table="$5"
  attempt=1
  while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
    if PGPASSWORD="$password" psql -h "$host" -U "$user" -d "$db" -t -A \
      -c "SELECT to_regclass('public.${table}') IS NOT NULL;" | grep -q t; then
      return 0
    fi
    echo "waiting for ${host}/${db}.${table} (${attempt}/${MAX_ATTEMPTS})..."
    sleep "$SLEEP_SEC"
    attempt=$((attempt + 1))
  done
  echo "timeout waiting for table ${table} on ${host}/${db}" >&2
  return 1
}

echo "billing-db-sync: waiting for mirror tables..."
wait_for_table "$SAAS_HOST" "$SAAS_DB" "$SAAS_USER" "$SAAS_PASSWORD" sys_user
wait_for_table "$BILLING_HOST" "$BILLING_DB" "$BILLING_USER" "$BILLING_PASSWORD" sys_user
wait_for_table "$BILLING_HOST" "$BILLING_DB" "$BILLING_USER" "$BILLING_PASSWORD" sys_tenant_feature

echo "billing-db-sync: copying sys_user..."
PGPASSWORD="$SAAS_PASSWORD" psql -h "$SAAS_HOST" -U "$SAAS_USER" -d "$SAAS_DB" -t -A -c \
  "COPY (SELECT id, tenant_id, email, status FROM sys_user) TO STDOUT" \
| PGPASSWORD="$BILLING_PASSWORD" psql -h "$BILLING_HOST" -U "$BILLING_USER" -d "$BILLING_DB" -v ON_ERROR_STOP=1 -c \
  "TRUNCATE sys_user; COPY sys_user (id, tenant_id, email, status) FROM STDIN"

echo "billing-db-sync: copying sys_tenant_feature..."
PGPASSWORD="$SAAS_PASSWORD" psql -h "$SAAS_HOST" -U "$SAAS_USER" -d "$SAAS_DB" -t -A -c \
  "COPY (SELECT tenant_id, feature_code FROM sys_tenant_feature) TO STDOUT" \
| PGPASSWORD="$BILLING_PASSWORD" psql -h "$BILLING_HOST" -U "$BILLING_USER" -d "$BILLING_DB" -v ON_ERROR_STOP=1 -c \
  "TRUNCATE sys_tenant_feature; COPY sys_tenant_feature (tenant_id, feature_code) FROM STDIN"

echo "billing-db-sync: OK"
