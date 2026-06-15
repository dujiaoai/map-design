package com.yunyan.billingapi.application.notification;

import com.yunyan.billingapi.domain.entity.BillingNotification;
import com.yunyan.billingapi.domain.mapper.BillingNotificationMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.NotificationDto;
import com.yunyan.billingapi.web.dto.NotificationListResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingNotificationService {

  public static final String CATEGORY_LOW_BALANCE = "low_balance";
  public static final String CATEGORY_RECHARGE_REFUND = "recharge_refund";

  private final BillingNotificationMapper notificationMapper;

  public BillingNotificationService(BillingNotificationMapper notificationMapper) {
    this.notificationMapper = notificationMapper;
  }

  public NotificationListResponse listForUser(SaasPrincipal principal, int page, int size) {
    var limit = Math.clamp(size, 1, 100);
    var offset = Math.max(page, 0) * limit;
    var items =
        notificationMapper.findForUser(principal.tenantId(), principal.userId(), limit, offset);
    var total = notificationMapper.countForUser(principal.tenantId(), principal.userId());
    return new NotificationListResponse(
        items.stream().map(BillingNotificationService::toDto).toList(), page, limit, total);
  }

  @Transactional
  public void markRead(SaasPrincipal principal, UUID notificationId) {
    var updated =
        notificationMapper.markRead(
            notificationId, principal.tenantId(), principal.userId(), Instant.now());
    if (updated != 1) {
      var existing =
          notificationMapper.findForUserById(
              notificationId, principal.tenantId(), principal.userId());
      if (existing == null) {
        throw AuthException.notFound("Notification not found");
      }
    }
  }

  @Transactional
  public int markAllRead(SaasPrincipal principal) {
    return notificationMapper.markAllRead(
        principal.tenantId(), principal.userId(), Instant.now());
  }

  public void notifyLowBalance(
      UUID tenantId, UUID userId, long availableBalance, long threshold) {
    var since = Instant.now().minus(24, ChronoUnit.HOURS);
    if (notificationMapper.countUnreadSince(
            tenantId, userId, CATEGORY_LOW_BALANCE, since)
        > 0) {
      return;
    }

    var notification = new BillingNotification();
    notification.setId(UUID.randomUUID());
    notification.setTenantId(tenantId);
    notification.setUserId(userId);
    notification.setCategory(CATEGORY_LOW_BALANCE);
    notification.setTitle("积分余额偏低");
    notification.setBody(
        String.format(
            "您的可用积分已降至 %d（低于 %d），请及时充值以免影响地图扣费。",
            availableBalance, threshold));
    notification.setDedupeKey(null);
    notification.setCreatedAt(Instant.now());
    notificationMapper.insert(notification);
  }

  public void notifyRechargeRefund(
      UUID tenantId, UUID userId, String orderNo, long pointsRefunded, String reason) {
    var notification = new BillingNotification();
    notification.setId(UUID.randomUUID());
    notification.setTenantId(tenantId);
    notification.setUserId(userId);
    notification.setCategory(CATEGORY_RECHARGE_REFUND);
    notification.setTitle("充值订单已退款");
    notification.setBody(
        String.format(
            "订单 %s 已退款，扣回 %d 积分。原因：%s", orderNo, pointsRefunded, reason));
    notification.setDedupeKey("refund:" + orderNo);
    notification.setCreatedAt(Instant.now());
    try {
      notificationMapper.insert(notification);
    } catch (DuplicateKeyException ignored) {
      // Idempotent refund replay.
    }
  }

  private static NotificationDto toDto(BillingNotification row) {
    return new NotificationDto(
        row.getId().toString(),
        row.getCategory(),
        row.getTitle(),
        row.getBody(),
        row.getReadAt() != null,
        row.getCreatedAt() != null ? row.getCreatedAt().toString() : null);
  }
}
