-- Phase 16-3: audit_webhook_target 区域标签（独立 ALTER）。
ALTER TABLE audit_webhook_target ADD COLUMN region VARCHAR(64) NOT NULL DEFAULT 'default';
