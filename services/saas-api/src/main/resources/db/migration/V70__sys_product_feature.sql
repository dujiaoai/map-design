-- Per-product tenant feature catalog (ADR-0019).
CREATE TABLE sys_product_feature (
    product_id  UUID         NOT NULL,
    code        VARCHAR(128) NOT NULL,
    name        VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    PRIMARY KEY (product_id, code),
    CONSTRAINT fk_sys_product_feature_product FOREIGN KEY (product_id) REFERENCES sys_product (id)
);

INSERT INTO sys_product_feature (product_id, code, name, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'custom.highway-alert', '高速预警', '高速预警图层与面板'),
    ('00000000-0000-0000-0000-000000000001', 'custom.live-share', '地图分享', '地图分享列表'),
    (
        '00000000-0000-0000-0000-000000000001',
        'billing.members-recharge-disabled',
        '关闭成员自助充值',
        '启用后普通成员不可自助充值，需租户管理员划拨或平台调账'
    );
