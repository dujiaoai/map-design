package com.yunyan.billingapi.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ApplyMembershipSyncEventsRequest(@NotEmpty @Valid List<MembershipSyncEventInput> items) {

  public record MembershipSyncEventInput(String id, String eventType, String payload) {}
}
