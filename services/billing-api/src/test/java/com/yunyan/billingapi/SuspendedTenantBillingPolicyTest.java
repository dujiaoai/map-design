package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.billing.dto.WalletHoldRequest;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.InternalAuthFilter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Regression: billing-api must not gate recharge or hold on {@code sys_tenant.status=suspended}.
 * Tenant suspension is enforced at saas-api login only (see billing-credits-prd §403 / auth-rbac).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SuspendedTenantBillingPolicyTest {

  private static final String INTERNAL_TOKEN = "test-billing-internal-token";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void rechargeOrder_isNotBlockedForSuspendedTenantPrincipal() throws Exception {
    var suspendedTenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            userId,
            suspendedTenantId,
            List.of(
                PermissionCodes.BILLING_WALLET_READ,
                PermissionCodes.BILLING_RECHARGE_CREATE,
                PermissionCodes.BILLING_LEDGER_READ));

    mockMvc
        .perform(
            post("/v1/billing/recharge-orders")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("packageCode", "starter_500", "channel", "mock"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("pending"));
  }

  @Test
  void internalHold_isNotBlockedForSuspendedTenant() throws Exception {
    var suspendedTenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();

    mockMvc
        .perform(
            post("/internal/v1/billing/signup-bonus")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .header(InternalAuthFilter.CALLER_SERVICE_HEADER, "saas-api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        new SignupBonusRequest(
                            suspendedTenantId,
                            userId,
                            "signup-bonus:"
                                + suspendedTenantId
                                + ":"
                                + userId))))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/internal/v1/billing/hold")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .header(InternalAuthFilter.CALLER_SERVICE_HEADER, "saas-api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        new WalletHoldRequest(
                            suspendedTenantId,
                            userId,
                            "map-workspace",
                            "billing.smoke.consume",
                            1,
                            "suspended-policy:" + suspendedTenantId + ":" + userId,
                            "suspended-tenant-policy-test"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.points").value(1));
  }
}
