package com.yunyan.billingapi.application.ratelimit;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.ratelimit.RateLimitException;
import com.yunyan.billingapi.security.ratelimit.RateLimitStore;
import com.yunyan.billingapi.web.support.ClientIpResolver;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class BillingRateLimitService {

  static final String MSG_WEBHOOK = "Too many webhook requests, try again later";
  static final String MSG_ADMIN_ADJUST = "Too many adjust requests, try again later";
  static final String MSG_ADMIN_REFUND = "Too many refund requests, try again later";

  private final RateLimitStore rateLimitStore;
  private final BillingAppProperties billingAppProperties;

  public void checkWebhook(HttpServletRequest request) {
    if (!enabled()) {
      return;
    }
    var webhook = billingAppProperties.getRateLimit().getWebhook();
    var ip = ClientIpResolver.resolve(request);
    consumeOrThrow(
        "webhook:ip:" + normalizeIp(ip),
        webhook.getIpMaxAttempts(),
        webhook.getIpWindow(),
        MSG_WEBHOOK);
  }

  public void checkAdminAdjust(UUID actorUserId) {
    if (!enabled() || actorUserId == null) {
      return;
    }
    var admin = billingAppProperties.getRateLimit().getAdmin();
    consumeOrThrow(
        "admin:adjust:" + actorUserId,
        admin.getAdjustMaxAttempts(),
        admin.getAdjustWindow(),
        MSG_ADMIN_ADJUST);
  }

  public void checkAdminRefund(UUID actorUserId) {
    if (!enabled() || actorUserId == null) {
      return;
    }
    var admin = billingAppProperties.getRateLimit().getAdmin();
    consumeOrThrow(
        "admin:refund:" + actorUserId,
        admin.getRefundMaxAttempts(),
        admin.getRefundWindow(),
        MSG_ADMIN_REFUND);
  }

  private boolean enabled() {
    return billingAppProperties.getRateLimit().isEnabled();
  }

  private void consumeOrThrow(String key, int maxAttempts, Duration window, String message) {
    var retryAfterSeconds = rateLimitStore.tryConsume(key, maxAttempts, window);
    if (retryAfterSeconds.isPresent()) {
      throw RateLimitException.exceeded(
          Duration.ofSeconds(Math.max(1, retryAfterSeconds.getAsLong())), message);
    }
  }

  private static String normalizeIp(String clientIp) {
    if (!StringUtils.hasText(clientIp)) {
      return "unknown";
    }
    return clientIp.trim();
  }
}
