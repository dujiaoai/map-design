package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.ProductAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.web.dto.admin.AdminProductDto;
import com.yunyan.saasapi.web.dto.admin.AdminProductListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/products")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminProductsController {

  private final ProductAdminService productAdminService;

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "列出 SaaS 产品线", description = "多产品基座注册表，供 Admin 产品上下文切换")
  public AdminProductListResponse listProducts() {
    return productAdminService.listProducts();
  }

  @GetMapping("/{code}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "按 code 查询产品线")
  public AdminProductDto getProduct(@PathVariable String code) {
    return productAdminService.getByCode(code);
  }
}
