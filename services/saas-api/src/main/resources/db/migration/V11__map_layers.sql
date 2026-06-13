CREATE TABLE map_layer (
    id          UUID         NOT NULL PRIMARY KEY,
    tenant_id   UUID         NOT NULL,
    name        VARCHAR(255) NOT NULL,
    layer_type  VARCHAR(64)  NOT NULL,
    visible     BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_map_layer_tenant FOREIGN KEY (tenant_id) REFERENCES sys_tenant (id)
);

CREATE INDEX idx_map_layer_tenant ON map_layer (tenant_id);
