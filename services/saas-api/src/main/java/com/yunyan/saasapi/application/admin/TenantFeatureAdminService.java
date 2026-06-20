package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.ProductRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.product.ProductCatalog;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminTenantFeaturesResponse;
import com.yunyan.saasapi.web.dto.admin.FeatureCatalogResponse;
import com.yunyan.saasapi.web.dto.admin.UpdateTenantFeaturesRequest;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantFeatureAdminService {

  private final TenantRepository tenantRepository;
  private final ProductRepository productRepository;
  private final ProductFeatureCatalogService productFeatureCatalogService;
  private final AdminAuditLogService adminAuditLogService;

  public FeatureCatalogResponse getCatalog() {
    return productFeatureCatalogService.getCatalogForProductCode(ProductCatalog.MAP_DESIGN_CODE);
  }

  public FeatureCatalogResponse getCatalogForProduct(String productCode) {
    return productFeatureCatalogService.getCatalogForProductCode(productCode);
  }

  public AdminTenantFeaturesResponse getFeatures(UUID tenantId) {
    requireTenant(tenantId);
    return new AdminTenantFeaturesResponse(
        tenantId.toString(), tenantRepository.findFeatureCodes(tenantId));
  }

  @Transactional
  public AdminTenantFeaturesResponse replaceFeatures(
      SaasPrincipal principal, UUID tenantId, UpdateTenantFeaturesRequest request) {
    var tenant = requireTenant(tenantId);
    var normalized = normalizeFeatureCodes(request.featureCodes());
    validateCatalogSubset(tenant.getPrimaryProductId(), normalized);
    tenantRepository.replaceFeatureCodes(tenantId, normalized);
    adminAuditLogService.recordTenantAction(
        principal,
        "tenant.features.update",
        tenantId,
        "Features -> " + String.join(",", normalized));
    return new AdminTenantFeaturesResponse(tenantId.toString(), normalized);
  }

  private com.yunyan.saasapi.domain.entity.SysTenant requireTenant(UUID tenantId) {
    return tenantRepository
        .findById(tenantId)
        .orElseThrow(() -> AuthException.notFound("Tenant not found"));
  }

  private static List<String> normalizeFeatureCodes(List<String> featureCodes) {
    if (featureCodes == null) {
      throw AuthException.badRequest("featureCodes is required");
    }
    var normalized = new LinkedHashSet<String>();
    for (String code : featureCodes) {
      if (code == null || code.isBlank()) {
        throw AuthException.badRequest("Feature code must not be blank");
      }
      normalized.add(code.trim());
    }
    return List.copyOf(normalized);
  }

  private void validateCatalogSubset(UUID primaryProductId, List<String> featureCodes) {
    var productId =
        primaryProductId != null ? primaryProductId : ProductCatalog.MAP_DESIGN_ID;
    var allowed = productFeatureCatalogService.allowedCodesForProductId(productId);
    var unknown = new ArrayList<String>();
    for (String code : featureCodes) {
      if (!allowed.contains(code)) {
        unknown.add(code);
      }
    }
    if (!unknown.isEmpty()) {
      throw AuthException.badRequest("Unknown feature codes: " + String.join(", ", unknown));
    }
  }

  public UUID resolveProductIdForTenant(UUID tenantId) {
    var tenant = requireTenant(tenantId);
    return tenant.getPrimaryProductId() != null
        ? tenant.getPrimaryProductId()
        : ProductCatalog.MAP_DESIGN_ID;
  }

  public String resolveProductCodeForTenant(UUID tenantId) {
    var productId = resolveProductIdForTenant(tenantId);
    return productRepository
        .findById(productId)
        .map(p -> p.getCode())
        .orElse(ProductCatalog.MAP_DESIGN_CODE);
  }

  public FeatureCatalogResponse getCatalogForTenant(UUID tenantId) {
    var code = resolveProductCodeForTenant(tenantId);
    return getCatalogForProduct(code);
  }
}
