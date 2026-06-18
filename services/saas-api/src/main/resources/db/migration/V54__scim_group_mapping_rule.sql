-- Phase 14-2: SCIM Group 映射规则引擎。
CREATE TABLE scim_group_mapping_rule (
    id                      UUID PRIMARY KEY,
    tenant_id               UUID         NOT NULL,
    external_group_pattern  VARCHAR(256) NOT NULL,
    tenant_role_id          UUID         NOT NULL,
    priority                INT          NOT NULL DEFAULT 0,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scim_group_mapping_rule_tenant ON scim_group_mapping_rule (tenant_id, priority DESC);
