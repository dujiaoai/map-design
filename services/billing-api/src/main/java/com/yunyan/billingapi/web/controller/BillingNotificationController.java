package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.notification.BillingNotificationService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.NotificationListResponse;
import com.yunyan.billingapi.web.dto.NotificationMarkAllReadResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing/notifications")
@Tag(name = "Billing Notifications")
@SecurityRequirement(name = "bearerAuth")
public class BillingNotificationController {

  private final BillingNotificationService notificationService;

  public BillingNotificationController(BillingNotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_WALLET_READ + "')")
  @Operation(summary = "查询当前用户计费通知")
  public NotificationListResponse listNotifications(
      @AuthenticationPrincipal SaasPrincipal principal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return notificationService.listForUser(principal, page, size);
  }

  @PostMapping("/{id}/read")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_WALLET_READ + "')")
  @Operation(summary = "标记单条计费通知已读")
  public void markRead(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID id) {
    notificationService.markRead(principal, id);
  }

  @PostMapping("/read-all")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_WALLET_READ + "')")
  @Operation(summary = "标记全部计费通知已读")
  public NotificationMarkAllReadResponse markAllRead(@AuthenticationPrincipal SaasPrincipal principal) {
    return new NotificationMarkAllReadResponse(notificationService.markAllRead(principal));
  }
}
