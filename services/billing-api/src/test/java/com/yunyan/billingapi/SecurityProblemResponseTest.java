package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yunyan.billingapi.domain.permission.PermissionCodes;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityProblemResponseTest {

  @Autowired MockMvc mockMvc;

  @Test
  void unauthenticatedBillingRequest_returnsProblemJson401() throws Exception {
    mockMvc
        .perform(get("/v1/billing/wallet"))
        .andExpect(status().isUnauthorized())
        .andExpect(content().contentType("application/problem+json"))
        .andExpect(jsonPath("$.status").value(401))
        .andExpect(jsonPath("$.title").value("Unauthorized"));
  }

  @Test
  void forbiddenBillingRequest_returnsProblemJson403() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            userId, tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

    mockMvc
        .perform(
            get("/v1/admin/billing/wallets")
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden())
        .andExpect(content().contentType("application/problem+json"))
        .andExpect(jsonPath("$.status").value(403))
        .andExpect(jsonPath("$.title").value("Forbidden"));
  }
}
