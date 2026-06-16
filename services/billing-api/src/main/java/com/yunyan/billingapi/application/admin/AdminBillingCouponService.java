package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.entity.BillingCoupon;
import com.yunyan.billingapi.domain.mapper.BillingCouponMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.application.coupon.BillingCouponService;
import com.yunyan.billingapi.application.admin.AdminAuditLogService;
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

  private static final int MAX_PAGE_SIZE = 100;
  private static final String DEFAULT_STATUS = "active";

  private final BillingCouponMapper couponMapper;
  private final AdminAuditLogService adminAuditLogService;

  public AdminBillingCouponService(
      BillingCouponMapper couponMapper, AdminAuditLogService adminAuditLogService) {
    this.couponMapper = couponMapper;
    this.adminAuditLogService = adminAuditLogService;
  }

  public AdminCouponListResponse listCoupons(String status, String code, int page, int size) {
    var safePage = Math.max(page, 0);
    var safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    var offset = safePage * safeSize;
    var normalizedStatus = normalizeFilterStatus(status);
    var normalizedCode = normalizeCodeFilter(code);

    var coupons = couponMapper.findCouponsAdmin(normalizedStatus, normalizedCode, safeSize, offset);
    var total = couponMapper.countCouponsAdmin(normalizedStatus, normalizedCode);
    var items = coupons.stream().map(AdminBillingCouponService::toDto).toList();
    return new AdminCouponListResponse(items, safePage, safeSize, total);
  }

  @Transactional
  public AdminCouponDto createCoupon(SaasPrincipal actor, CreateAdminCouponRequest request) {
    var code = BillingCouponService.normalizeCode(request.code());
    if (couponMapper.findByCode(code) != null) {
      throw AuthException.conflict("Coupon code already exists");
    }

    var now = Instant.now();
    var kind = BillingCouponService.resolveKind(request.kind());
    var coupon = new BillingCoupon();
    coupon.setId(UUID.randomUUID());
    coupon.setCode(code);
    coupon.setKind(kind);
    if (BillingCouponService.KIND_DISCOUNT.equals(kind)) {
      if (request.discountCents() == null || request.discountCents() <= 0) {
        throw AuthException.badRequest("discountCents is required for discount coupons");
      }
      coupon.setDiscountCents(request.discountCents());
      coupon.setPoints(1L);
    } else {
      coupon.setPoints(request.points());
    }
    coupon.setStatus(resolveStatus(request.status()));
    coupon.setMaxTotalRedemptions(request.maxTotalRedemptions());
    coupon.setRedemptionCount(0);
    coupon.setMaxPerUser(request.maxPerUser() != null ? request.maxPerUser() : 1);
    coupon.setValidUntil(parseInstant(request.validUntil()));
    coupon.setCreatedAt(now);
    coupon.setUpdatedAt(now);
    couponMapper.insert(coupon);

    adminAuditLogService.recordBillingCouponWrite(
        actor, coupon.getId(), coupon.getCode(), "created kind=" + kind);
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
    adminAuditLogService.recordBillingCouponWrite(
        actor,
        refreshed.getId(),
        refreshed.getCode(),
        "updated status=" + refreshed.getStatus());
    return toDto(refreshed);
  }

  private static AdminCouponDto toDto(BillingCoupon coupon) {
    return new AdminCouponDto(
        coupon.getId().toString(),
        coupon.getCode(),
        BillingCouponService.resolveKind(coupon.getKind()),
        coupon.getPoints() != null ? coupon.getPoints() : 0L,
        coupon.getDiscountCents(),
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

  private static String normalizeFilterStatus(String status) {
    if (!StringUtils.hasText(status) || "all".equalsIgnoreCase(status.trim())) {
      return null;
    }
    return status.trim();
  }

  private static String normalizeCodeFilter(String code) {
    return StringUtils.hasText(code) ? code.trim() : null;
  }
}
