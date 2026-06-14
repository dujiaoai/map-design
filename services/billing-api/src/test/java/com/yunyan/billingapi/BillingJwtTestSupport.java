package com.yunyan.billingapi;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

final class BillingJwtTestSupport {

  private static final String TEST_SECRET = "test-jwt-secret-with-at-least-32-bytes!!";
  private static final String TEST_ISSUER = "yunyan-saas-test";

  private BillingJwtTestSupport() {}

  static String accessToken(UUID userId, UUID tenantId, List<String> permissions) {
    var now = Instant.now();
    return Jwts.builder()
        .issuer(TEST_ISSUER)
        .subject(userId.toString())
        .claim("tenant_id", tenantId.toString())
        .claim("typ", "access")
        .claim("roles", List.of("MEMBER"))
        .claim("permissions", permissions)
        .claim("perm_epoch", 1)
        .issuedAt(java.util.Date.from(now))
        .expiration(java.util.Date.from(now.plus(15, ChronoUnit.MINUTES)))
        .signWith(Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8)))
        .compact();
  }
}
