-- Phase 16-3: 审计 Webhook 合规归档。
CREATE TABLE audit_webhook_archive (
    id          UUID PRIMARY KEY,
    payload     TEXT         NOT NULL,
    region      VARCHAR(64)  NOT NULL DEFAULT 'default',
    archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_webhook_archive_region ON audit_webhook_archive (region, archived_at DESC);
