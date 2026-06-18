-- GDPR-style tenant data export request queue (skeleton).
CREATE TABLE tenant_data_export_request (
    id                   UUID PRIMARY KEY,
    tenant_id            UUID         NOT NULL REFERENCES sys_tenant (id),
    status               VARCHAR(32)  NOT NULL DEFAULT 'pending',
    requested_by_user_id UUID,
    artifact_url         VARCHAR(512),
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at         TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tenant_data_export_tenant ON tenant_data_export_request (tenant_id, created_at DESC);
