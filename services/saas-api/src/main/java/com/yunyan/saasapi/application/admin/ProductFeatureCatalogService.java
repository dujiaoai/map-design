package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.ProductFeatureRepository;
import com.yunyan.saasapi.domain.ProductRepository;
import com.yunyan.saasapi.domain.entity.SysProductFeature;
import com.yunyan.saasapi.domain.product.ProductCatalog;
import com.yunyan.saasapi.domain.tenant.TenantFeatureCatalog;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.FeatureCatalogEntryDto;
import com.yunyan.saasapi.web.dto.admin.FeatureCatalogResponse;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ProductFeatureCatalogService {

  private final ProductRepository productRepository;
  private final ProductFeatureRepository productFeatureRepository;

  public FeatureCatalogResponse getCatalogForProductCode(String productCode) {
    var code = StringUtils.hasText(productCode) ? productCode.trim() : ProductCatalog.MAP_DESIGN_CODE;
    var product =
        productRepository
            .findByCode(code)
            .orElseThrow(() -> AuthException.notFound("Product not found: " + code));
    return getCatalogForProductId(product.getId());
  }

  public FeatureCatalogResponse getCatalogForProductId(UUID productId) {
    var dbFeatures = productFeatureRepository.findByProductId(productId);
    if (!dbFeatures.isEmpty()) {
      return new FeatureCatalogResponse(dbFeatures.stream().map(ProductFeatureCatalogService::toDto).toList());
    }
    return fallbackJavaCatalog();
  }

  public Set<String> allowedCodesForProductId(UUID productId) {
    var dbCodes = productFeatureRepository.findCodesByProductId(productId);
    if (!dbCodes.isEmpty()) {
      return dbCodes;
    }
    return TenantFeatureCatalog.CODES;
  }

  public Set<String> allowedCodesForProductCode(String productCode) {
    var product =
        productRepository
            .findByCode(
                StringUtils.hasText(productCode) ? productCode.trim() : ProductCatalog.MAP_DESIGN_CODE)
            .orElseThrow(() -> AuthException.notFound("Product not found: " + productCode));
    return allowedCodesForProductId(product.getId());
  }

  private static FeatureCatalogResponse fallbackJavaCatalog() {
    var features =
        TenantFeatureCatalog.ENTRIES.stream()
            .map(entry -> new FeatureCatalogEntryDto(entry.code(), entry.name(), entry.description()))
            .toList();
    return new FeatureCatalogResponse(features);
  }

  private static FeatureCatalogEntryDto toDto(SysProductFeature feature) {
    return new FeatureCatalogEntryDto(feature.getCode(), feature.getName(), feature.getDescription());
  }

  public static List<String> filterUnknownCodes(Set<String> allowed, List<String> requested) {
    var unknown = new java.util.ArrayList<String>();
    for (String code : requested) {
      if (!allowed.contains(code)) {
        unknown.add(code);
      }
    }
    return unknown;
  }

  public static Set<String> mergeAllowedCodes(Set<String> primary) {
    return new LinkedHashSet<>(primary);
  }
}
