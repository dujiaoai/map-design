-- Phase 8-2: 审计 Webhook 投递游标。
CREATE TABLE sys_admin_audit_webhook_cursor (
    id                 VARCHAR(32) NOT NULL PRIMARY KEY,
    last_delivered_id  UUID,
    last_delivered_at  TIMESTAMP WITH TIME ZONE,
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sys_admin_audit_webhook_cursor (id) VALUES ('default');
