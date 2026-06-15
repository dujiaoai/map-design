package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billing.dto.SignupBonusRequest;
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
class BillingWalletPostgresIntegrationTest extends BillingPostgresIntegrationTestSupport {

  private static final String INTERNAL_TOKEN = "test-billing-internal-token";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void signupBonusAndWallet_onPostgresWithRls() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();

    mockMvc
        .perform(
            post("/internal/v1/billing/signup-bonus")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        new SignupBonusRequest(tenantId, userId, "personal"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.balance").value(500));

    mockMvc
        .perform(
            get("/v1/billing/wallet")
                .header(
                    "Authorization",
                    "Bearer "
                        + BillingJwtTestSupport.accessToken(
                            userId, tenantId, List.of("billing:wallet:read"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.balance").value(500))
        .andExpect(jsonPath("$.frozenBalance").value(0));
  }
}
