-- Phase 5D-1: 租户级 OIDC 连接配置（骨架，每租户一条）。
CREATE TABLE tenant_oidc_config (
    tenant_id     UUID PRIMARY KEY REFERENCES sys_tenant (id),
    enabled       BOOLEAN      NOT NULL DEFAULT false,
    display_name  VARCHAR(128),
    issuer_uri    VARCHAR(512),
    client_id     VARCHAR(256),
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
