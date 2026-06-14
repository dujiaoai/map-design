package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.PermEpochStaleException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "billing.jwt.perm-epoch=2")
class PermEpochAuthFilterTest {

  private static final String TEST_SECRET = "test-jwt-secret-with-at-least-32-bytes!!";
  private static final String TEST_ISSUER = "yunyan-saas-test";

  @Autowired MockMvc mockMvc;

  @Test
  void stalePermEpoch_returns403ProblemDetail() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token = staleAccessToken(userId, tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

    mockMvc
        .perform(get("/v1/billing/wallet").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.type").value(PermEpochStaleException.PROBLEM_TYPE))
        .andExpect(jsonPath("$.status").value(403));
  }

  private static String staleAccessToken(UUID userId, UUID tenantId, List<String> permissions) {
    var now = Instant.now();
    return Jwts.builder()
        .issuer(TEST_ISSUER)
        .subject(userId.toString())
        .claim("tenant_id", tenantId.toString())
        .claim("typ", "access")
        .claim("roles", List.of("MEMBER"))
        .claim("permissions", permissions)
        .claim("perm_epoch", 0)
        .issuedAt(java.util.Date.from(now))
        .expiration(java.util.Date.from(now.plus(15, ChronoUnit.MINUTES)))
        .signWith(Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8)))
        .compact();
  }
}
