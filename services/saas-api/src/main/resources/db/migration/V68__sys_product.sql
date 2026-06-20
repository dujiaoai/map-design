-- Multi-SaaS product registry (ADR-0019).
CREATE TABLE sys_product (
    id          UUID PRIMARY KEY,
    code        VARCHAR(64)  NOT NULL,
    name        VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    status      VARCHAR(16)  NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sys_product_code UNIQUE (code)
);

INSERT INTO sys_product (id, code, name, description, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'map-design',
    '地图工作台',
    'saas-web 地图 SaaS 产品线',
    'active'
);
