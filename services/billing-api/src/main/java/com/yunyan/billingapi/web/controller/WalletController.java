package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.wallet.WalletService;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.WalletResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class WalletController {

  private final WalletService walletService;

  public WalletController(WalletService walletService) {
    this.walletService = walletService;
  }

  @GetMapping("/wallet")
  @Operation(summary = "查询当前用户钱包余额")
  public WalletResponse getWallet(@AuthenticationPrincipal SaasPrincipal principal) {
    var wallet = walletService.getOrCreateWallet(principal.tenantId(), principal.userId());
    var balance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var frozen = wallet.getFrozenBalance() != null ? wallet.getFrozenBalance() : 0L;
    return new WalletResponse(wallet.getId(), balance, frozen, balance - frozen);
  }
}
