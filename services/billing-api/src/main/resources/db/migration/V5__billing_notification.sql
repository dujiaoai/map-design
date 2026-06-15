CREATE TABLE billing_notification (
    id          UUID PRIMARY KEY,
    tenant_id   UUID NOT NULL,
    user_id     UUID NOT NULL,
    category    VARCHAR(32) NOT NULL,
    title       VARCHAR(128) NOT NULL,
    body        VARCHAR(512) NOT NULL,
    dedupe_key  VARCHAR(128),
    read_at     TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_billing_notification_category CHECK (
        category IN ('low_balance', 'recharge_refund')
    ),
    CONSTRAINT uq_billing_notification_dedupe UNIQUE (dedupe_key)
);

CREATE INDEX idx_billing_notification_user
    ON billing_notification (tenant_id, user_id, created_at DESC);
