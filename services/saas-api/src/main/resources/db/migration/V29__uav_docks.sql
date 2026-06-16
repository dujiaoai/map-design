CREATE TABLE uav_dock (
    id               UUID         NOT NULL PRIMARY KEY,
    tenant_id        UUID         NOT NULL,
    name             VARCHAR(255) NOT NULL,
    location_label   VARCHAR(512),
    drone_count      INT          NOT NULL DEFAULT 0,
    status           VARCHAR(32)  NOT NULL DEFAULT 'offline',
    battery_percent  INT,
    sort_order       INT          NOT NULL DEFAULT 0,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_uav_dock_tenant FOREIGN KEY (tenant_id) REFERENCES sys_tenant (id)
);

CREATE INDEX idx_uav_dock_tenant ON uav_dock (tenant_id);
