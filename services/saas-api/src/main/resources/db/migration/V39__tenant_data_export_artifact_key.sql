-- Phase 8-3: GDPR 导出 artifact 对象键与失败信息。
ALTER TABLE tenant_data_export_request ADD COLUMN artifact_object_key VARCHAR(512);
ALTER TABLE tenant_data_export_request ADD COLUMN error_message VARCHAR(512);
