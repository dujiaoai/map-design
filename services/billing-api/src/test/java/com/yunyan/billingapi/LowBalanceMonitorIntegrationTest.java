package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "billing.low-balance.enabled=true",
      "billing.low-balance.threshold=50"
    })
class LowBalanceMonitorIntegrationTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @Autowired MeterRegistry meterRegistry;

  @BeforeEach
  void ensureMembershipSchema() {
    BillingTestMembershipSupport.ensureSchema(jdbcTemplate);
  }

  @Test
  void negativeAdjust_crossingThreshold_recordsLowBalanceMetric() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_ADJUST));
    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, userId, "active");

    var before = meterRegistry.get("billing.wallet.low_balance").counter().count();

    mockMvc
        .perform(
            post("/v1/admin/billing/tenants/{tenantId}/adjust", tenantId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "userId",
                            userId.toString(),
                            "amount",
                            100,
                            "remark",
                            "seed",
                            "idempotencyKey",
                            "admin-adjust:low-balance-seed"))))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/v1/admin/billing/tenants/{tenantId}/adjust", tenantId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "userId",
                            userId.toString(),
                            "amount",
                            -60,
                            "remark",
                            "debit",
                            "idempotencyKey",
                            "admin-adjust:low-balance-debit"))))
        .andExpect(status().isOk());

    assertThat(meterRegistry.get("billing.wallet.low_balance").counter().count())
        .isEqualTo(before + 1);
  }
}
