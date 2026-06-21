package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.ProductFeatureRepository;
import com.yunyan.saasapi.domain.ProductRepository;
import com.yunyan.saasapi.domain.entity.SysProduct;
import com.yunyan.saasapi.domain.entity.SysProductFeature;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminProductDto;
import com.yunyan.saasapi.web.dto.admin.AdminProductListResponse;
import com.yunyan.saasapi.web.dto.admin.CreateProductFeatureRequest;
import com.yunyan.saasapi.web.dto.admin.CreateProductRequest;
import com.yunyan.saasapi.web.dto.admin.FeatureCatalogEntryDto;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ProductAdminService {

  private static final String STATUS_ACTIVE = "active";

  private final ProductRepository productRepository;
  private final ProductFeatureRepository productFeatureRepository;
  private final AdminAuditLogService adminAuditLogService;

  public AdminProductListResponse listProducts() {
    var products = productRepository.findAll().stream().map(ProductAdminService::toDto).toList();
    return new AdminProductListResponse(products);
  }

  public AdminProductDto getByCode(String code) {
    var product =
        productRepository
            .findByCode(code)
            .orElseThrow(
                () ->
                    com.yunyan.saasapi.security.AuthException.notFound(
                        "Product not found: " + code));
    return toDto(product);
  }

  @Transactional
  public AdminProductDto createProduct(SaasPrincipal principal, CreateProductRequest request) {
    var code = request.code().trim().toLowerCase();
    if (productRepository.existsByCode(code)) {
      throw AuthException.conflict("Product code already exists: " + code);
    }

    var product = new SysProduct();
    product.setId(UUID.randomUUID());
    product.setCode(code);
    product.setName(request.name().trim());
    product.setDescription(normalizeOptionalText(request.description()));
    product.setStatus(STATUS_ACTIVE);
    product.setCreatedAt(Instant.now());
    productRepository.insert(product);

    adminAuditLogService.recordProductAction(
        principal, "product.create", product.getId(), "Created product " + code);
    return toDto(product);
  }

  @Transactional
  public FeatureCatalogEntryDto addProductFeature(
      SaasPrincipal principal, String productCode, CreateProductFeatureRequest request) {
    var product =
        productRepository
            .findByCode(productCode)
            .orElseThrow(
                () -> AuthException.notFound("Product not found: " + productCode));
    var code = request.code().trim();
    if (productFeatureRepository.existsByProductIdAndCode(product.getId(), code)) {
      throw AuthException.conflict("Product feature already exists: " + code);
    }

    var feature = new SysProductFeature();
    feature.setProductId(product.getId());
    feature.setCode(code);
    feature.setName(request.name().trim());
    feature.setDescription(normalizeOptionalText(request.description()));
    productFeatureRepository.insert(feature);

    adminAuditLogService.recordProductAction(
        principal,
        "product.feature.create",
        product.getId(),
        "Added feature " + code + " to product " + product.getCode());
    return new FeatureCatalogEntryDto(feature.getCode(), feature.getName(), feature.getDescription());
  }

  static AdminProductDto toDto(SysProduct product) {
    var createdAt = product.getCreatedAt() == null ? 0L : product.getCreatedAt().toEpochMilli();
    return new AdminProductDto(
        product.getId().toString(),
        product.getCode(),
        product.getName(),
        product.getDescription(),
        product.getStatus() == null ? STATUS_ACTIVE : product.getStatus(),
        createdAt);
  }

  private static String normalizeOptionalText(String value) {
    if (!StringUtils.hasText(value)) {
      return null;
    }
    return value.trim();
  }
}
