-- Phase 13-2: SCIM schema extension 自定义属性。
CREATE TABLE scim_schema_extension (
    tenant_id       UUID PRIMARY KEY,
    attributes_json TEXT NOT NULL DEFAULT '[]',
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
