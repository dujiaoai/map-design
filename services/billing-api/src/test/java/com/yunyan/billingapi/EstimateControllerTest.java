package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class EstimateControllerTest {

  @Autowired MockMvc mockMvc;

  @Test
  void estimate_smokeRule_returnsOnePoint() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            userId, tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

    mockMvc
        .perform(
            get("/v1/billing/estimate")
                .header("Authorization", "Bearer " + token)
                .param("productCode", "map-workspace")
                .param("ruleCode", "billing.smoke.consume")
                .param("quantity", "1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.points").value(1))
        .andExpect(jsonPath("$.quantity").value(1));
  }

  @Test
  void estimate_withoutPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token = BillingJwtTestSupport.accessToken(userId, tenantId, List.of());

    mockMvc
        .perform(
            get("/v1/billing/estimate")
                .header("Authorization", "Bearer " + token)
                .param("productCode", "map-workspace")
                .param("ruleCode", "billing.smoke.consume"))
        .andExpect(status().isForbidden());
  }
}
