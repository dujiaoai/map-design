-- Phase 8-2: 审计 Webhook 死信表。
CREATE TABLE sys_admin_audit_webhook_dead_letter (
    id           UUID PRIMARY KEY,
    log_id       UUID         NOT NULL REFERENCES sys_admin_audit_log (id),
    payload      TEXT         NOT NULL,
    attempts     INT          NOT NULL DEFAULT 1,
    last_error   VARCHAR(512),
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_webhook_dead_letter_log ON sys_admin_audit_webhook_dead_letter (log_id);
