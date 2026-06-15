package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.InternalAuthFilter;
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
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BillingTransferControllerTest {

  private static final String INTERNAL_TOKEN = "test-billing-internal-token";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @BeforeEach
  void ensureMembershipSchema() {
    BillingTestMembershipSupport.ensureSchema(jdbcTemplate);
  }

  @Test
  void transfer_movesPointsFromAdminToMember() throws Exception {
    var tenantId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var memberId = UUID.randomUUID();
    grantSignupBonus(tenantId, adminId);
    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, memberId, "active");

    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.BILLING_TRANSFER_CREATE));

    mockMvc
        .perform(
            post("/v1/billing/transfer")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "toUserId",
                            memberId.toString(),
                            "amount",
                            100,
                            "remark",
                            "team allocation",
                            "idempotencyKey",
                            "transfer:test-1"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.amount").value(100))
        .andExpect(jsonPath("$.fromBalanceAfter").value(900))
        .andExpect(jsonPath("$.toBalanceAfter").value(100))
        .andExpect(jsonPath("$.idempotentReplay").value(false));
  }

  @Test
  void transfer_idempotentReplay_returnsSameResult() throws Exception {
    var tenantId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var memberId = UUID.randomUUID();
    grantSignupBonus(tenantId, adminId);
    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, memberId, "active");

    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.BILLING_TRANSFER_CREATE));

    var body =
        Map.of(
            "toUserId",
            memberId.toString(),
            "amount",
            50,
            "remark",
            "team allocation",
            "idempotencyKey",
            "transfer:test-replay");

    mockMvc
        .perform(
            post("/v1/billing/transfer")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.idempotentReplay").value(false));

    mockMvc
        .perform(
            post("/v1/billing/transfer")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.idempotentReplay").value(true))
        .andExpect(jsonPath("$.amount").value(50));
  }

  @Test
  void transfer_withoutPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var memberId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

    mockMvc
        .perform(
            post("/v1/billing/transfer")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "toUserId",
                            memberId.toString(),
                            "amount",
                            10,
                            "idempotencyKey",
                            "transfer:forbidden"))))
        .andExpect(status().isForbidden());
  }

  @Test
  void transfer_withInsufficientBalance_returns402() throws Exception {
    var tenantId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var memberId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.BILLING_TRANSFER_CREATE));
    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, memberId, "active");

    mockMvc
        .perform(
            post("/v1/billing/transfer")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "toUserId",
                            memberId.toString(),
                            "amount",
                            100,
                            "idempotencyKey",
                            "transfer:402"))))
        .andExpect(status().isPaymentRequired());
  }

  private void grantSignupBonus(UUID tenantId, UUID userId) throws Exception {
    mockMvc
        .perform(
            post("/internal/v1/billing/signup-bonus")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        new SignupBonusRequest(tenantId, userId, "standard"))))
        .andExpect(status().isOk());
  }
}
