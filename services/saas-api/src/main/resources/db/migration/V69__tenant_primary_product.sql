-- Tenant primary product association (ADR-0019).
ALTER TABLE sys_tenant ADD COLUMN primary_product_id UUID;

UPDATE sys_tenant
SET primary_product_id = '00000000-0000-0000-0000-000000000001'
WHERE primary_product_id IS NULL;

ALTER TABLE sys_tenant
    ADD CONSTRAINT fk_sys_tenant_primary_product
        FOREIGN KEY (primary_product_id) REFERENCES sys_product (id);

CREATE INDEX idx_sys_tenant_primary_product ON sys_tenant (primary_product_id);
