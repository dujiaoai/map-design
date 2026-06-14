package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.entity.BillingRechargePackage;
import com.yunyan.billingapi.domain.mapper.BillingRechargePackageMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.AdminRechargePackageDto;
import com.yunyan.billingapi.web.dto.AdminRechargePackageListResponse;
import com.yunyan.billingapi.web.dto.CreateAdminPackageRequest;
import com.yunyan.billingapi.web.dto.PatchAdminPackageRequest;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBillingPackageService {

  private static final String DEFAULT_CURRENCY = "CNY";
  private static final String DEFAULT_STATUS = "active";

  private final BillingRechargePackageMapper packageMapper;
  private final AdminAuditLogService adminAuditLogService;

  public AdminBillingPackageService(
      BillingRechargePackageMapper packageMapper, AdminAuditLogService adminAuditLogService) {
    this.packageMapper = packageMapper;
    this.adminAuditLogService = adminAuditLogService;
  }

  public AdminRechargePackageListResponse listPackages() {
    var items =
        packageMapper.findAllPackages().stream()
            .map(this::toDto)
            .toList();
    return new AdminRechargePackageListResponse(items);
  }

  @Transactional
  public AdminRechargePackageDto createPackage(
      SaasPrincipal actor, CreateAdminPackageRequest request) {
    var code = request.code().trim();
    if (!StringUtils.hasText(code)) {
      throw AuthException.badRequest("Package code is required");
    }
    if (packageMapper.findByCode(code) != null) {
      throw AuthException.conflict("Package code already exists");
    }

    var pkg = new BillingRechargePackage();
    pkg.setId(UUID.randomUUID());
    pkg.setCode(code);
    pkg.setPoints(request.points());
    pkg.setPriceCents(request.priceCents());
    pkg.setCurrency(resolveCurrency(request.currency()));
    pkg.setStatus(resolveStatus(request.status()));
    pkg.setSortOrder(request.sortOrder() != null ? request.sortOrder() : 0);
    pkg.setCreatedAt(Instant.now());
    packageMapper.insert(pkg);

    adminAuditLogService.recordBillingPackageWrite(
        actor,
        pkg.getId(),
        code,
        "create points="
            + pkg.getPoints()
            + " priceCents="
            + pkg.getPriceCents()
            + " status="
            + pkg.getStatus());

    return toDto(pkg);
  }

  @Transactional
  public AdminRechargePackageDto patchPackage(
      SaasPrincipal actor, String code, PatchAdminPackageRequest request) {
    var normalizedCode = code.trim();
    var existing = packageMapper.findByCode(normalizedCode);
    if (existing == null) {
      throw AuthException.notFound("Package not found");
    }

    var hasChange = false;
    if (request.points() != null) {
      existing.setPoints(request.points());
      hasChange = true;
    }
    if (request.priceCents() != null) {
      existing.setPriceCents(request.priceCents());
      hasChange = true;
    }
    if (StringUtils.hasText(request.currency())) {
      existing.setCurrency(request.currency().trim());
      hasChange = true;
    }
    if (StringUtils.hasText(request.status())) {
      existing.setStatus(request.status().trim());
      hasChange = true;
    }
    if (request.sortOrder() != null) {
      existing.setSortOrder(request.sortOrder());
      hasChange = true;
    }
    if (!hasChange) {
      throw AuthException.badRequest("No fields to update");
    }

    if (packageMapper.update(existing) != 1) {
      throw AuthException.conflict("Package update failed");
    }

    adminAuditLogService.recordBillingPackageWrite(
        actor,
        existing.getId(),
        normalizedCode,
        "patch points="
            + existing.getPoints()
            + " priceCents="
            + existing.getPriceCents()
            + " status="
            + existing.getStatus());

    return toDto(existing);
  }

  private AdminRechargePackageDto toDto(BillingRechargePackage pkg) {
    return new AdminRechargePackageDto(
        pkg.getId(),
        pkg.getCode(),
        pkg.getPoints() != null ? pkg.getPoints() : 0L,
        pkg.getPriceCents() != null ? pkg.getPriceCents() : 0L,
        pkg.getCurrency(),
        pkg.getStatus(),
        pkg.getSortOrder() != null ? pkg.getSortOrder() : 0);
  }

  private static String resolveCurrency(String currency) {
    return StringUtils.hasText(currency) ? currency.trim() : DEFAULT_CURRENCY;
  }

  private static String resolveStatus(String status) {
    return StringUtils.hasText(status) ? status.trim() : DEFAULT_STATUS;
  }
}
