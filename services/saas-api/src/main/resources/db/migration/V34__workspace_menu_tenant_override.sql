-- Phase 5E-1: 租户菜单覆盖（inherit 平台模板 + diff）。
CREATE TABLE workspace_menu_tenant_override (
    id          UUID PRIMARY KEY,
    tenant_id   UUID         NOT NULL REFERENCES sys_tenant (id),
    item_id     VARCHAR(64)  NOT NULL REFERENCES workspace_menu_item (id),
    enabled     BOOLEAN,
    sort_order  INT,
    title       VARCHAR(128),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, item_id)
);

CREATE INDEX idx_workspace_menu_tenant_override ON workspace_menu_tenant_override (tenant_id, item_id);
