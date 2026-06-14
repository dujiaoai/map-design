package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.ledger.LedgerService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.LedgerListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class LedgerController {

  private final LedgerService ledgerService;

  public LedgerController(LedgerService ledgerService) {
    this.ledgerService = ledgerService;
  }

  @GetMapping("/ledger")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_LEDGER_READ + "')")
  @Operation(summary = "分页查询当前用户积分流水")
  public LedgerListResponse listLedger(
      @AuthenticationPrincipal SaasPrincipal principal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ledgerService.listMyLedger(principal, page, size);
  }
}
