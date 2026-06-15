package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.internal.InternalMembershipService;
import com.yunyan.saasapi.web.dto.internal.MembershipCheckResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/membership")
@Tag(name = "Internal")
@RequiredArgsConstructor
public class InternalMembershipController {

  private final InternalMembershipService internalMembershipService;

  @GetMapping("/tenants/{tenantId}/users/{userId}")
  @Operation(summary = "校验用户是否为租户成员（billing-api 独立库场景）")
  public MembershipCheckResponse checkMembership(
      @PathVariable UUID tenantId, @PathVariable UUID userId) {
    return internalMembershipService.checkMembership(tenantId, userId);
  }
}
