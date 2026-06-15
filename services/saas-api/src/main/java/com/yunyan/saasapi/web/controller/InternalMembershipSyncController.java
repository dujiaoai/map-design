package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.internal.InternalMembershipSyncService;
import com.yunyan.saasapi.web.dto.internal.AckMembershipSyncEventsRequest;
import com.yunyan.saasapi.web.dto.internal.AckMembershipSyncEventsResponse;
import com.yunyan.saasapi.web.dto.internal.MembershipSyncEventListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/membership/sync-events")
@Tag(name = "Internal")
@RequiredArgsConstructor
public class InternalMembershipSyncController {

  private final InternalMembershipSyncService internalMembershipSyncService;

  @GetMapping
  @Operation(summary = "拉取待同步 membership 事件（billing-api CDC）")
  public MembershipSyncEventListResponse listPending(
      @RequestParam(defaultValue = "100") int limit) {
    return internalMembershipSyncService.listPendingEvents(limit);
  }

  @PostMapping("/ack")
  @Operation(summary = "确认 membership 事件已应用")
  public AckMembershipSyncEventsResponse acknowledge(
      @Valid @RequestBody AckMembershipSyncEventsRequest request) {
    return internalMembershipSyncService.acknowledge(request.eventIds());
  }
}
