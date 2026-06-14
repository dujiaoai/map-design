package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.admin.AdminBillingAdjustService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.web.dto.AdminAdjustRequest;
import com.yunyan.billingapi.web.dto.AdminAdjustResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/billing")
@Tag(name = "Admin Billing")
@SecurityRequirement(name = "bearerAuth")
public class AdminBillingController {

  private final AdminBillingAdjustService adminBillingAdjustService;

  public AdminBillingController(AdminBillingAdjustService adminBillingAdjustService) {
    this.adminBillingAdjustService = adminBillingAdjustService;
  }

  @PostMapping("/tenants/{tenantId}/adjust")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_ADJUST + "')")
  @Operation(summary = "平台人工调账（赠送/冲正/企业预付）")
  public AdminAdjustResponse adjustWallet(
      @PathVariable UUID tenantId, @Valid @RequestBody AdminAdjustRequest request) {
    return adminBillingAdjustService.adjust(tenantId, request);
  }
}
