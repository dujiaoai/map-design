CREATE TABLE billing_ops_alert (
    id            UUID PRIMARY KEY,
    alert_type    VARCHAR(64) NOT NULL,
    severity      VARCHAR(16) NOT NULL,
    reference_key VARCHAR(128) NOT NULL,
    title         VARCHAR(256) NOT NULL,
    body          TEXT NOT NULL,
    payload_json  TEXT,
    resolved_at   TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_billing_ops_alert_reference UNIQUE (alert_type, reference_key),
    CONSTRAINT chk_billing_ops_alert_severity CHECK (
        severity IN ('warning', 'critical')
    )
);

CREATE INDEX idx_billing_ops_alert_type_created
    ON billing_ops_alert (alert_type, created_at DESC);
