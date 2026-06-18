-- Phase 14-3: 审计 Webhook 目标健康检查。
ALTER TABLE audit_webhook_target ADD COLUMN consecutive_failures INT NOT NULL DEFAULT 0;
ALTER TABLE audit_webhook_target ADD COLUMN last_health_check_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE audit_webhook_target ADD COLUMN unhealthy_since TIMESTAMP WITH TIME ZONE;
