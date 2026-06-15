-- saas-api → billing-api membership mirror CDC outbox (dedicated billing PG).
CREATE TABLE IF NOT EXISTS billing_membership_sync_event (
    id           UUID PRIMARY KEY,
    event_type   VARCHAR(64) NOT NULL,
    payload      TEXT NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_billing_membership_sync_event_pending
    ON billing_membership_sync_event (created_at, processed_at);
