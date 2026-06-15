package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.tenant.MembershipMirrorApplyService;
import com.yunyan.billingapi.application.tenant.MembershipMirrorApplyService.MembershipMirrorSyncEvent;
import com.yunyan.billingapi.web.dto.ApplyMembershipSyncEventsRequest;
import com.yunyan.billingapi.web.dto.ApplyMembershipSyncEventsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/billing/membership")
@Tag(name = "Billing Internal")
@ConditionalOnExpression(
    "'cdc'.equals('${billing.membership-sync.source:local}') || ${billing.membership-sync.push-receive-enabled:false}")
public class InternalMembershipMirrorController {

  private final MembershipMirrorApplyService membershipMirrorApplyService;

  public InternalMembershipMirrorController(MembershipMirrorApplyService membershipMirrorApplyService) {
    this.membershipMirrorApplyService = membershipMirrorApplyService;
  }

  @PostMapping("/sync-events")
  @Operation(summary = "应用 saas-api 推送的 membership CDC 事件")
  public ApplyMembershipSyncEventsResponse applySyncEvents(
      @Valid @RequestBody ApplyMembershipSyncEventsRequest request) {
    var events =
        request.items().stream()
            .map(item -> new MembershipMirrorSyncEvent(item.id(), item.eventType(), item.payload()))
            .toList();
    return new ApplyMembershipSyncEventsResponse(membershipMirrorApplyService.applyEvents(events));
  }
}
