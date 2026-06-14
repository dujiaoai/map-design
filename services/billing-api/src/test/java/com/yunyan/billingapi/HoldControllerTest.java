package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.billing.dto.WalletHoldRequest;
import com.yunyan.billingapi.security.InternalAuthFilter;
import java.util.Map;
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
class HoldControllerTest {

  private static final String INTERNAL_TOKEN = "test-billing-internal-token";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void holdConfirmCycle_debitsWallet() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    grantSignupBonus(tenantId, userId);

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
                                "smoke:" + tenantId + ":" + userId,
                                "smoke-test"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.points").value(1))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var holdId = objectMapper.readTree(holdBody).get("holdId").asText();

    mockMvc
        .perform(
            get("/internal/v1/billing/estimate")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .param("tenantId", tenantId.toString())
                .param("userId", userId.toString())
                .param("productCode", "map-workspace")
                .param("ruleCode", "billing.smoke.consume")
                .param("quantity", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.points").value(1));

    mockMvc
        .perform(
            post("/internal/v1/billing/hold/" + holdId + "/confirm")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/v1/billing/wallet")
                .header(
                    "Authorization",
                    "Bearer "
                        + BillingJwtTestSupport.accessToken(
                            userId, tenantId, java.util.List.of("billing:wallet:read"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.balance").value(499))
        .andExpect(jsonPath("$.frozenBalance").value(0));
  }

  @Test
  void hold_withInsufficientBalance_returns402() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();

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
                            "smoke-empty:" + tenantId,
                            null))))
        .andExpect(status().isPaymentRequired())
        .andExpect(jsonPath("$.availableBalance").value(0))
        .andExpect(jsonPath("$.requiredPoints").value(1));
  }

  @Test
  void holdCancel_restoresAvailableBalance() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    grantSignupBonus(tenantId, userId);

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
                                "smoke-cancel:" + tenantId,
                                null))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var holdId = objectMapper.readTree(holdBody).get("holdId").asText();

    mockMvc
        .perform(
            post("/internal/v1/billing/hold/" + holdId + "/cancel")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/v1/billing/wallet")
                .header(
                    "Authorization",
                    "Bearer "
                        + BillingJwtTestSupport.accessToken(
                            userId, tenantId, java.util.List.of("billing:wallet:read"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.availableBalance").value(500));
  }

  private void grantSignupBonus(UUID tenantId, UUID userId) throws Exception {
    mockMvc
        .perform(
            post("/internal/v1/billing/signup-bonus")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        new SignupBonusRequest(tenantId, userId, "personal"))))
        .andExpect(status().isOk());
  }
}
