package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.security.ratelimit.RateLimitException;
import com.yunyan.saasapi.security.ratelimit.RateLimitStore;
import java.time.Duration;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthRateLimitService {

  static final String MSG_LOGIN = "Too many login attempts, try again later";
  static final String MSG_REGISTER = "Too many registration attempts, try again later";
  static final String MSG_PASSWORD_RESET = "Too many password reset attempts, try again later";

  private final RateLimitStore rateLimitStore;
  private final SaasAppProperties saasAppProperties;

  public void checkLogin(String clientIp, String email, String tenantSlug) {
    if (!enabled()) {
      return;
    }
    var login = saasAppProperties.getRateLimit().getLogin();
    consumeOrThrow("login:ip:" + normalizeIp(clientIp), login.getIpMaxAttempts(), login.getIpWindow(), MSG_LOGIN);
    if (StringUtils.hasText(email) && StringUtils.hasText(tenantSlug)) {
      blockIfExceeded(accountKey(email, tenantSlug), login.getAccountMaxAttempts(), login.getAccountWindow(), MSG_LOGIN);
    }
  }

  public void recordLoginFailure(String email, String tenantSlug) {
    if (!enabled() || !StringUtils.hasText(email) || !StringUtils.hasText(tenantSlug)) {
      return;
    }
    var login = saasAppProperties.getRateLimit().getLogin();
    consumeOrThrow(accountKey(email, tenantSlug), login.getAccountMaxAttempts(), login.getAccountWindow(), MSG_LOGIN);
  }

  public void clearLoginFailures(String email, String tenantSlug) {
    if (!enabled() || !StringUtils.hasText(email) || !StringUtils.hasText(tenantSlug)) {
      return;
    }
    rateLimitStore.reset(accountKey(email, tenantSlug));
  }

  public void checkRegister(String clientIp, String email) {
    if (!enabled()) {
      return;
    }
    var register = saasAppProperties.getRateLimit().getRegister();
    consumeOrThrow(
        "register:ip:" + normalizeIp(clientIp),
        register.getIpMaxAttempts(),
        register.getIpWindow(),
        MSG_REGISTER);
    if (StringUtils.hasText(email)) {
      consumeOrThrow(
          "register:email:" + normalizeEmail(email),
          register.getEmailMaxAttempts(),
          register.getEmailWindow(),
          MSG_REGISTER);
    }
  }

  public void checkPasswordResetRequest(String clientIp, String email, String tenantSlug) {
    if (!enabled()) {
      return;
    }
    var reset = saasAppProperties.getRateLimit().getPasswordReset();
    consumeOrThrow(
        "reset:ip:" + normalizeIp(clientIp),
        reset.getIpMaxAttempts(),
        reset.getIpWindow(),
        MSG_PASSWORD_RESET);
    if (StringUtils.hasText(email) && StringUtils.hasText(tenantSlug)) {
      consumeOrThrow(
          "reset:email:" + normalizeEmail(email) + ":" + tenantSlug.trim().toLowerCase(Locale.ROOT),
          reset.getEmailMaxAttempts(),
          reset.getEmailWindow(),
          MSG_PASSWORD_RESET);
    }
  }

  private boolean enabled() {
    return saasAppProperties.getRateLimit().isEnabled();
  }

  private void consumeOrThrow(String key, int maxAttempts, Duration window, String message) {
    var retryAfterSeconds = rateLimitStore.tryConsume(key, maxAttempts, window);
    if (retryAfterSeconds.isPresent()) {
      throw exceeded(retryAfterSeconds.getAsLong(), message);
    }
  }

  private void blockIfExceeded(String key, int maxAttempts, Duration window, String message) {
    var retryAfterSeconds = rateLimitStore.retryAfterIfBlocked(key, maxAttempts, window);
    if (retryAfterSeconds.isPresent()) {
      throw exceeded(retryAfterSeconds.getAsLong(), message);
    }
  }

  private static RateLimitException exceeded(long retryAfterSeconds, String message) {
    return RateLimitException.exceeded(Duration.ofSeconds(Math.max(1, retryAfterSeconds)), message);
  }

  private static String accountKey(String email, String tenantSlug) {
    return "login:account:" + normalizeEmail(email) + ":" + tenantSlug.trim().toLowerCase(Locale.ROOT);
  }

  private static String normalizeEmail(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }

  private static String normalizeIp(String clientIp) {
    if (!StringUtils.hasText(clientIp)) {
      return "unknown";
    }
    return clientIp.trim();
  }
}
