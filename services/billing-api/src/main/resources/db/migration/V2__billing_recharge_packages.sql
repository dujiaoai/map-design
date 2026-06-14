-- Sprint F-2: default recharge SKUs (billing-api).
INSERT INTO billing_recharge_package (id, code, points, price_cents, currency, status, sort_order)
SELECT '00000000-0000-0000-0000-000000000201', 'starter_500', 500, 4900, 'CNY', 'active', 10
WHERE NOT EXISTS (SELECT 1 FROM billing_recharge_package WHERE code = 'starter_500');

INSERT INTO billing_recharge_package (id, code, points, price_cents, currency, status, sort_order)
SELECT '00000000-0000-0000-0000-000000000202', 'standard_2000', 2000, 17900, 'CNY', 'active', 20
WHERE NOT EXISTS (SELECT 1 FROM billing_recharge_package WHERE code = 'standard_2000');

INSERT INTO billing_recharge_package (id, code, points, price_cents, currency, status, sort_order)
SELECT '00000000-0000-0000-0000-000000000203', 'pro_5000', 5000, 39900, 'CNY', 'active', 30
WHERE NOT EXISTS (SELECT 1 FROM billing_recharge_package WHERE code = 'pro_5000');
