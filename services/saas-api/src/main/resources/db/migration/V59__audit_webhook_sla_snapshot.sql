-- Phase 15-3: 审计 Webhook SLA 日快照。
CREATE TABLE audit_webhook_sla_snapshot (
    snapshot_date   DATE PRIMARY KEY,
    delivery_rate   DOUBLE PRECISION NOT NULL DEFAULT 0,
    avg_latency_ms  DOUBLE PRECISION NOT NULL DEFAULT 0,
    dead_letter_count BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
