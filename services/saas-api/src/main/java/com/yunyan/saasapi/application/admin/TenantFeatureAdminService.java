package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.tenant.TenantFeatureCatalog;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminTenantFeaturesResponse;
import com.yunyan.saasapi.web.dto.admin.FeatureCatalogEntryDto;
import com.yunyan.saasapi.web.dto.admin.FeatureCatalogResponse;
import com.yunyan.saasapi.web.dto.admin.UpdateTenantFeaturesRequest;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TenantFeatureAdminService {

  private final TenantRepository tenantRepository;

  public FeatureCatalogResponse getCatalog() {
    var features =
        TenantFeatureCatalog.ENTRIES.stream()
            .map(entry -> new FeatureCatalogEntryDto(entry.code(), entry.name(), entry.description()))
            .toList();
    return new FeatureCatalogResponse(features);
  }

  public AdminTenantFeaturesResponse getFeatures(UUID tenantId) {
    requireTenant(tenantId);
    return new AdminTenantFeaturesResponse(
        tenantId.toString(), tenantRepository.findFeatureCodes(tenantId));
  }

  @Transactional
  public AdminTenantFeaturesResponse replaceFeatures(
      UUID tenantId, UpdateTenantFeaturesRequest request) {
    requireTenant(tenantId);
    var normalized = normalizeFeatureCodes(request.featureCodes());
    validateCatalogSubset(normalized);
    tenantRepository.replaceFeatureCodes(tenantId, normalized);
    return new AdminTenantFeaturesResponse(tenantId.toString(), normalized);
  }

  private void requireTenant(UUID tenantId) {
    tenantRepository
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

  private static void validateCatalogSubset(List<String> featureCodes) {
    var unknown = new ArrayList<String>();
    for (String code : featureCodes) {
      if (!TenantFeatureCatalog.CODES.contains(code)) {
        unknown.add(code);
      }
    }
    if (!unknown.isEmpty()) {
      throw AuthException.badRequest("Unknown feature codes: " + String.join(", ", unknown));
    }
  }
}
