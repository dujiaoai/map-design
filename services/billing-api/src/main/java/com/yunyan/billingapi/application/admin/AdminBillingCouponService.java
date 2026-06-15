package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.entity.BillingCoupon;
import com.yunyan.billingapi.domain.mapper.BillingCouponMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.application.coupon.BillingCouponService;
import com.yunyan.billingapi.web.dto.AdminCouponDto;
import com.yunyan.billingapi.web.dto.AdminCouponListResponse;
import com.yunyan.billingapi.web.dto.CreateAdminCouponRequest;
import com.yunyan.billingapi.web.dto.PatchAdminCouponRequest;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBillingCouponService {

  private static final String DEFAULT_STATUS = "active";

  private final BillingCouponMapper couponMapper;

  public AdminBillingCouponService(BillingCouponMapper couponMapper) {
    this.couponMapper = couponMapper;
  }

  public AdminCouponListResponse listCoupons() {
    var items = couponMapper.findAll().stream().map(AdminBillingCouponService::toDto).toList();
    return new AdminCouponListResponse(items);
  }

  @Transactional
  public AdminCouponDto createCoupon(SaasPrincipal actor, CreateAdminCouponRequest request) {
    var code = BillingCouponService.normalizeCode(request.code());
    if (couponMapper.findByCode(code) != null) {
      throw AuthException.conflict("Coupon code already exists");
    }

    var now = Instant.now();
    var coupon = new BillingCoupon();
    coupon.setId(UUID.randomUUID());
    coupon.setCode(code);
    coupon.setPoints(request.points());
    coupon.setStatus(resolveStatus(request.status()));
    coupon.setMaxTotalRedemptions(request.maxTotalRedemptions());
    coupon.setRedemptionCount(0);
    coupon.setMaxPerUser(request.maxPerUser() != null ? request.maxPerUser() : 1);
    coupon.setValidUntil(parseInstant(request.validUntil()));
    coupon.setCreatedAt(now);
    coupon.setUpdatedAt(now);
    couponMapper.insert(coupon);

    return toDto(coupon);
  }

  @Transactional
  public AdminCouponDto patchCoupon(
      SaasPrincipal actor, String code, PatchAdminCouponRequest request) {
    var normalizedCode = BillingCouponService.normalizeCode(code);
    var existing = couponMapper.findByCode(normalizedCode);
    if (existing == null) {
      throw AuthException.notFound("Coupon not found");
    }

    var status = StringUtils.hasText(request.status()) ? request.status().trim() : existing.getStatus();
    var maxTotal =
        request.maxTotalRedemptions() != null
            ? request.maxTotalRedemptions()
            : existing.getMaxTotalRedemptions();
    var validUntil =
        request.validUntil() != null
            ? parseInstant(request.validUntil())
            : existing.getValidUntil();

    if (!StringUtils.hasText(request.status())
        && request.maxTotalRedemptions() == null
        && request.validUntil() == null) {
      throw AuthException.badRequest("No fields to update");
    }

    if (couponMapper.update(normalizedCode, status, maxTotal, validUntil, Instant.now()) != 1) {
      throw AuthException.conflict("Coupon update failed");
    }

    var refreshed = couponMapper.findByCode(normalizedCode);
    return toDto(refreshed);
  }

  private static AdminCouponDto toDto(BillingCoupon coupon) {
    return new AdminCouponDto(
        coupon.getId().toString(),
        coupon.getCode(),
        coupon.getPoints() != null ? coupon.getPoints() : 0L,
        coupon.getStatus(),
        coupon.getMaxTotalRedemptions(),
        coupon.getRedemptionCount() != null ? coupon.getRedemptionCount() : 0,
        coupon.getMaxPerUser() != null ? coupon.getMaxPerUser() : 1,
        coupon.getValidUntil() != null ? coupon.getValidUntil().toString() : null,
        coupon.getCreatedAt() != null ? coupon.getCreatedAt().toString() : null);
  }

  private static String resolveStatus(String status) {
    return StringUtils.hasText(status) ? status.trim() : DEFAULT_STATUS;
  }

  private static Instant parseInstant(String value) {
    if (!StringUtils.hasText(value)) {
      return null;
    }
    return Instant.parse(value.trim());
  }
}
