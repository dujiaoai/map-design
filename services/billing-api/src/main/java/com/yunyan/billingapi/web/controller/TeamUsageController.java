package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.usage.TeamUsageService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.TeamUsageSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import org.springframework.format.annotation.DateTimeFormat;
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
public class TeamUsageController {

  private final TeamUsageService teamUsageService;

  public TeamUsageController(TeamUsageService teamUsageService) {
    this.teamUsageService = teamUsageService;
  }

  @GetMapping("/team/usage")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_USAGE_READ + "')")
  @Operation(summary = "租户成员消费汇总（不含他人余额）")
  public TeamUsageSummaryResponse teamUsage(
      @AuthenticationPrincipal SaasPrincipal principal,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          Instant from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          Instant to,
      @RequestParam(required = false) String productCode) {
    return teamUsageService.getTeamUsage(principal, from, to, productCode);
  }
}
