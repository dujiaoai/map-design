package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.ProductRepository;
import com.yunyan.saasapi.domain.entity.SysProduct;
import com.yunyan.saasapi.web.dto.admin.AdminProductDto;
import com.yunyan.saasapi.web.dto.admin.AdminProductListResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductAdminService {

  private final ProductRepository productRepository;

  public AdminProductListResponse listProducts() {
    var products = productRepository.findAllActive().stream().map(ProductAdminService::toDto).toList();
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

  static AdminProductDto toDto(SysProduct product) {
    var createdAt = product.getCreatedAt() == null ? 0L : product.getCreatedAt().toEpochMilli();
    return new AdminProductDto(
        product.getId().toString(),
        product.getCode(),
        product.getName(),
        product.getDescription(),
        product.getStatus() == null ? "active" : product.getStatus(),
        createdAt);
  }
}
