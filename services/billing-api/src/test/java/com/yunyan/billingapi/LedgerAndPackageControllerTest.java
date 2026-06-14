package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billing.dto.SignupBonusRequest;
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
class LedgerAndPackageControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void listLedger_returnsSignupBonusEntry() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    grantSignupBonus(tenantId, userId);

    var token =
        BillingJwtTestSupport.accessToken(
            userId,
            tenantId,
            List.of(
                PermissionCodes.BILLING_WALLET_READ, PermissionCodes.BILLING_LEDGER_READ));

    mockMvc
        .perform(get("/v1/billing/ledger").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(1))
        .andExpect(jsonPath("$.items[0].entryType").value("adjust"))
        .andExpect(jsonPath("$.items[0].amount").value(500))
        .andExpect(jsonPath("$.items[0].remark").value("signup_bonus"));
  }

  @Test
  void listLedger_withoutPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            userId, tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

    mockMvc
        .perform(get("/v1/billing/ledger").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
  }

  @Test
  void listPackages_returnsSeededSkus() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            userId, tenantId, List.of(PermissionCodes.BILLING_RECHARGE_CREATE));

    mockMvc
        .perform(get("/v1/billing/packages").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items", org.hamcrest.Matchers.hasSize(3)))
        .andExpect(jsonPath("$.items[0].code").value("starter_500"))
        .andExpect(jsonPath("$.items[0].points").value(500))
        .andExpect(jsonPath("$.items[0].priceCents").value(4900));
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
