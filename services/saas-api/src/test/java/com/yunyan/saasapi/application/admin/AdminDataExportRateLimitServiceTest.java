package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.security.ratelimit.InMemoryRateLimitStore;
import com.yunyan.saasapi.security.ratelimit.RateLimitException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AdminDataExportRateLimitServiceTest {

  private static final UUID USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
  private static final UUID TENANT_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");

  private final SaasAppProperties properties = new SaasAppProperties();
  private AdminDataExportRateLimitService service;

  @BeforeEach
  void setUp() {
    properties.getRateLimit().setEnabled(true);
    properties.getRateLimit().getAdminDataExport().setEnabled(true);
    properties.getRateLimit().getAdminDataExport().setMaxPerUserPerWindow(2);
    service = new AdminDataExportRateLimitService(new InMemoryRateLimitStore(), properties);
  }

  @Test
  void checkDownload_withinLimit_passes() {
    service.checkDownload(principal());
    service.checkDownload(principal());
  }

  @Test
  void checkDownload_exceedsLimit_throws429() {
    service.checkDownload(principal());
    service.checkDownload(principal());

    assertThatThrownBy(() -> service.checkDownload(principal()))
        .isInstanceOf(RateLimitException.class)
        .hasMessageContaining(AdminDataExportRateLimitService.MSG_EXCEEDED);
  }

  private static SaasPrincipal principal() {
    return new SaasPrincipal(
        USER_ID,
        TENANT_ID,
        null,
        "admin@demo.local",
        List.of("PLATFORM_ADMIN"),
        List.of("admin:tenants:read"),
        "jti",
        Instant.now().plusSeconds(900));
  }
}
