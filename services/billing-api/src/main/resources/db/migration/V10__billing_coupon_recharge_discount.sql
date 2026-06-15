-- F-5+ recharge checkout discount coupons (gift coupons unchanged).
ALTER TABLE billing_coupon ADD COLUMN IF NOT EXISTS kind VARCHAR(16) NOT NULL DEFAULT 'gift';
ALTER TABLE billing_coupon ADD COLUMN IF NOT EXISTS discount_cents BIGINT;

ALTER TABLE billing_coupon DROP CONSTRAINT IF EXISTS chk_billing_coupon_points;
ALTER TABLE billing_coupon ADD CONSTRAINT chk_billing_coupon_kind CHECK (kind IN ('gift', 'discount'));
ALTER TABLE billing_coupon ADD CONSTRAINT chk_billing_coupon_points CHECK (
    (kind = 'gift' AND points > 0)
    OR (kind = 'discount' AND discount_cents IS NOT NULL AND discount_cents > 0)
);

ALTER TABLE billing_recharge_order ADD COLUMN IF NOT EXISTS list_price_cents BIGINT;
ALTER TABLE billing_recharge_order ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(64);
ALTER TABLE billing_recharge_order ADD COLUMN IF NOT EXISTS coupon_discount_cents BIGINT NOT NULL DEFAULT 0;

UPDATE billing_recharge_order SET list_price_cents = price_cents WHERE list_price_cents IS NULL;
