package com.yunyan.saasapi.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.saasapi.application.auth.AuthenticatedUser;
import com.yunyan.saasapi.config.JwtProperties;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

  private static final UUID USER_ID = UUID.fromString("22222222-2222-2222-2222-222222222201");
  private static final UUID HOME_TENANT_ID = UUID.fromString("11111111-1111-1111-1111-111111111101");
  private static final UUID ACT_AS_TENANT_ID =
      UUID.fromString("99999999-9999-9999-9999-999999999901");

  private JwtService jwtService;

  @BeforeEach
  void setUp() {
    jwtService =
        new JwtService(
            new JwtProperties(
                "test-issuer",
                "0123456789012345678901234567890123456789012345678901234567890",
                Duration.ofMinutes(15),
                Duration.ofDays(7),
                Duration.ofSeconds(30),
                0));
  }

  @Test
  void issueAndParseAccessToken_withoutActAsTenant() {
    var user = sampleUser();
    var issued = jwtService.issueAccessToken(user);
    var parsed = jwtService.parseAccessToken(issued.token());

    assertThat(parsed.userId()).isEqualTo(USER_ID);
    assertThat(parsed.tenantId()).isEqualTo(HOME_TENANT_ID);
    assertThat(parsed.actAsTenantId()).isNull();
  }

  @Test
  void issueAndParseAccessToken_withActAsTenant() {
    var user = sampleUser();
    var issued = jwtService.issueAccessToken(user, ACT_AS_TENANT_ID);
    var parsed = jwtService.parseAccessToken(issued.token());

    assertThat(parsed.tenantId()).isEqualTo(HOME_TENANT_ID);
    assertThat(parsed.actAsTenantId()).isEqualTo(ACT_AS_TENANT_ID);
  }

  @Test
  void refreshToken_preservesActAsTenant() {
    var user = sampleUser();
    var issued = jwtService.issueRefreshToken(user, ACT_AS_TENANT_ID);
    var parsed = jwtService.parseRefreshToken(issued.token());

    assertThat(parsed.actAsTenantId()).isEqualTo(ACT_AS_TENANT_ID);
  }

  private static AuthenticatedUser sampleUser() {
    return new AuthenticatedUser(
        USER_ID,
        HOME_TENANT_ID,
        "Home Tenant",
        "home",
        "platform@test.local",
        "Platform Admin",
        null,
        null,
        "hash",
        List.of("PLATFORM_ADMIN"),
        List.of("admin:tenants:read"));
  }
}
