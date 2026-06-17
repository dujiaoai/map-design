CREATE INDEX idx_billing_ops_alert_open
    ON billing_ops_alert (alert_type, created_at DESC)
    WHERE resolved_at IS NULL;
