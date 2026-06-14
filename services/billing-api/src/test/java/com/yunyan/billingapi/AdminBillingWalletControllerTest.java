package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.InternalAuthFilter;
import com.yunyan.billing.dto.SignupBonusRequest;
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
class AdminBillingWalletControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void listWallets_filtersByTenantAndUser() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var otherUserId = UUID.randomUUID();
    grantSignupBonus(tenantId, userId);
    grantSignupBonus(tenantId, otherUserId);

    var token =
        BillingJwtTestSupport.accessToken(
            UUID.randomUUID(), tenantId, List.of(PermissionCodes.ADMIN_BILLING_READ));

    mockMvc
        .perform(
            get("/v1/admin/billing/wallets")
                .param("tenantId", tenantId.toString())
                .param("userId", userId.toString())
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(1))
        .andExpect(jsonPath("$.items[0].userId").value(userId.toString()))
        .andExpect(jsonPath("$.items[0].balance").value(500));
  }

  @Test
  void listWallets_withoutPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            UUID.randomUUID(), tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

    mockMvc
        .perform(
            get("/v1/admin/billing/wallets")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
  }

  private void grantSignupBonus(UUID tenantId, UUID userId) throws Exception {
    mockMvc
        .perform(
            post("/internal/v1/billing/signup-bonus")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, "test-billing-internal-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        new SignupBonusRequest(tenantId, userId, "personal"))))
        .andExpect(status().isOk());
  }
}
