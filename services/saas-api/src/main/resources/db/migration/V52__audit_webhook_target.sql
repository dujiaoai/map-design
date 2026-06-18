-- Phase 13-3: 审计 Webhook 多目标路由。
CREATE TABLE audit_webhook_target (
    id          UUID PRIMARY KEY,
    url         VARCHAR(2048) NOT NULL,
    format      VARCHAR(32)   NOT NULL DEFAULT 'jsonl',
    enabled     BOOLEAN       NOT NULL DEFAULT TRUE,
    priority    INT           NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_webhook_target_priority ON audit_webhook_target (priority DESC, created_at ASC);
