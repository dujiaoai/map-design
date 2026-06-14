package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.packagecatalog.RechargePackageService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.web.dto.RechargePackageListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class RechargePackageController {

  private final RechargePackageService rechargePackageService;

  public RechargePackageController(RechargePackageService rechargePackageService) {
    this.rechargePackageService = rechargePackageService;
  }

  @GetMapping("/packages")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "列出可购买的充值套餐")
  public RechargePackageListResponse listPackages() {
    return rechargePackageService.listActivePackages();
  }
}
