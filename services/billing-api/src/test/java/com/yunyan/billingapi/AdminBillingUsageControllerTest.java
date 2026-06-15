package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.billing.dto.WalletHoldRequest;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.InternalAuthFilter;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminBillingUsageControllerTest {

  private static final String INTERNAL_TOKEN = "test-billing-internal-token";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void getUsage_returnsConfirmedConsumptionAcrossTenants() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminToken =
        BillingJwtTestSupport.accessToken(
            UUID.randomUUID(), tenantId, List.of(PermissionCodes.ADMIN_BILLING_READ));

    grantSignupBonus(tenantId, userId);
    confirmHold(tenantId, userId, "admin-usage:" + tenantId + ":" + userId);

    mockMvc
        .perform(
            get("/v1/admin/billing/usage")
                .header("Authorization", "Bearer " + adminToken)
                .param("tenantId", tenantId.toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalPoints").value(1))
        .andExpect(jsonPath("$.page").value(0))
        .andExpect(jsonPath("$.size").value(20))
        .andExpect(jsonPath("$.total").value(1))
        .andExpect(jsonPath("$.items", org.hamcrest.Matchers.hasSize(1)))
        .andExpect(jsonPath("$.items[0].tenantId").value(tenantId.toString()))
        .andExpect(jsonPath("$.items[0].userId").value(userId.toString()))
        .andExpect(jsonPath("$.items[0].totalPoints").value(1))
        .andExpect(jsonPath("$.items[0].eventCount").value(1));
  }

  @Test
  void getUsage_withoutPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            UUID.randomUUID(), tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

    mockMvc
        .perform(get("/v1/admin/billing/usage").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
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

  private void confirmHold(UUID tenantId, UUID userId, String idempotencyKey) throws Exception {
    var holdBody =
        mockMvc
            .perform(
                post("/internal/v1/billing/hold")
                    .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            new WalletHoldRequest(
                                tenantId,
                                userId,
                                "map-workspace",
                                "billing.smoke.consume",
                                1,
                                idempotencyKey,
                                "admin-usage-test"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var holdId = objectMapper.readTree(holdBody).get("holdId").asText();

    mockMvc
        .perform(
            post("/internal/v1/billing/hold/" + holdId + "/confirm")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN))
        .andExpect(status().isOk());
  }
}
