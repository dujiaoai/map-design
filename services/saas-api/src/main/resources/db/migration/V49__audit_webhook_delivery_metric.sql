-- Phase 12-3: 审计 Webhook 投递 SLA 日 rollup。
CREATE TABLE audit_webhook_delivery_metric (
    id               UUID PRIMARY KEY,
    metric_date      DATE NOT NULL,
    success_count    BIGINT NOT NULL DEFAULT 0,
    failure_count    BIGINT NOT NULL DEFAULT 0,
    total_latency_ms BIGINT NOT NULL DEFAULT 0,
    recorded_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_audit_webhook_metric_date ON audit_webhook_delivery_metric (metric_date);
