package com.yunyan.billingapi.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.application.tenant.MembershipMirrorApplyService;
import com.yunyan.billingapi.application.tenant.MembershipMirrorApplyService.MembershipMirrorSyncEvent;
import com.yunyan.billingapi.application.tenant.MembershipPushSignatureService;
import com.yunyan.billingapi.web.dto.ApplyMembershipSyncEventsRequest;
import com.yunyan.billingapi.web.dto.ApplyMembershipSyncEventsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/billing/membership")
@Tag(name = "Billing Internal")
@ConditionalOnExpression(
    "'cdc'.equals('${billing.membership-sync.source:local}') || ${billing.membership-sync.push-receive-enabled:false}")
public class InternalMembershipMirrorController {

  private final MembershipMirrorApplyService membershipMirrorApplyService;
  private final MembershipPushSignatureService membershipPushSignatureService;
  private final ObjectMapper objectMapper;
  private final Validator validator;

  public InternalMembershipMirrorController(
      MembershipMirrorApplyService membershipMirrorApplyService,
      MembershipPushSignatureService membershipPushSignatureService,
      ObjectMapper objectMapper,
      Validator validator) {
    this.membershipMirrorApplyService = membershipMirrorApplyService;
    this.membershipPushSignatureService = membershipPushSignatureService;
    this.objectMapper = objectMapper;
    this.validator = validator;
  }

  @PostMapping("/sync-events")
  @Operation(summary = "应用 saas-api 推送的 membership CDC 事件")
  public ApplyMembershipSyncEventsResponse applySyncEvents(
      @RequestHeader(value = MembershipPushSignatureService.SIGNATURE_HEADER, required = false)
          String signature,
      @RequestBody String rawBody)
      throws Exception {
    membershipPushSignatureService.verifyIfEnabled(rawBody, signature);
    var request = objectMapper.readValue(rawBody, ApplyMembershipSyncEventsRequest.class);
    var violations = validator.validate(request);
    if (!violations.isEmpty()) {
      throw new ConstraintViolationException(violations);
    }
    var events =
        request.items().stream()
            .map(item -> new MembershipMirrorSyncEvent(item.id(), item.eventType(), item.payload()))
            .toList();
    return new ApplyMembershipSyncEventsResponse(membershipMirrorApplyService.applyEvents(events));
  }
}
