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
class AdminBillingPackageControllerTest {

  @Autowired MockMvc mockMvc;

  @Test
  void listPackages_returnsSeededSkus() throws Exception {
    var tenantId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            UUID.randomUUID(), tenantId, List.of(PermissionCodes.ADMIN_BILLING_READ));

    mockMvc
        .perform(
            get("/v1/admin/billing/packages").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items", org.hamcrest.Matchers.hasSize(3)))
        .andExpect(jsonPath("$.page").value(0))
        .andExpect(jsonPath("$.size").value(20))
        .andExpect(jsonPath("$.total").value(3))
        .andExpect(jsonPath("$.items[0].code").value("starter_500"))
        .andExpect(jsonPath("$.items[0].status").value("active"));
  }

  @Test
  void listPackages_withoutPermission_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            UUID.randomUUID(), tenantId, List.of(PermissionCodes.BILLING_WALLET_READ));

    mockMvc
        .perform(
            get("/v1/admin/billing/packages").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
  }
}
