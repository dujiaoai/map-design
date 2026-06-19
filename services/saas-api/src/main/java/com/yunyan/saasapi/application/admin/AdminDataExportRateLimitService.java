package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.security.ratelimit.RateLimitException;
import com.yunyan.saasapi.security.ratelimit.RateLimitStore;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDataExportRateLimitService {

  static final String MSG_EXCEEDED = "Admin data export download rate limit exceeded";

  private final RateLimitStore rateLimitStore;
  private final SaasAppProperties saasAppProperties;

  public void checkDownload(SaasPrincipal principal) {
    if (principal == null || !enabled()) {
      return;
    }
    var config = saasAppProperties.getRateLimit().getAdminDataExport();
    var retryAfterSeconds =
        rateLimitStore.tryConsume(
            "admin-data-export:" + principal.userId(),
            config.getMaxPerUserPerWindow(),
            config.getWindow());
    if (retryAfterSeconds.isPresent()) {
      throw RateLimitException.exceeded(
          Duration.ofSeconds(Math.max(1, retryAfterSeconds.getAsLong())), MSG_EXCEEDED);
    }
  }

  private boolean enabled() {
    return saasAppProperties.getRateLimit().isEnabled()
        && saasAppProperties.getRateLimit().getAdminDataExport().isEnabled();
  }
}
