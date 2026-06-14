package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.domain.mapper.SysTenantFeatureMapper;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.domain.tenant.TenantFeatureCodes;
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MembersRechargePolicyControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired SysTenantFeatureMapper tenantFeatureMapper;

  @Test
  void createRechargeOrder_whenMemberRechargeDisabled_returns403() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    tenantFeatureMapper.insert(tenantId, TenantFeatureCodes.MEMBERS_RECHARGE_DISABLED);

    var token =
        BillingJwtTestSupport.accessToken(
            userId,
            tenantId,
            List.of(PermissionCodes.BILLING_RECHARGE_CREATE));

    mockMvc
        .perform(
            post("/v1/billing/recharge-orders")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("packageCode", "starter_500", "channel", "mock"))))
        .andExpect(status().isForbidden());
  }

  @Test
  void createRechargeOrder_tenantAdminBypassesDisabledPolicy() throws Exception {
    var tenantId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    tenantFeatureMapper.insert(tenantId, TenantFeatureCodes.MEMBERS_RECHARGE_DISABLED);

    var token =
        BillingJwtTestSupport.accessToken(
            adminId,
            tenantId,
            List.of(PermissionCodes.BILLING_RECHARGE_CREATE),
            List.of("TENANT_ADMIN"));

    mockMvc
        .perform(
            post("/v1/billing/recharge-orders")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("packageCode", "starter_500", "channel", "mock"))))
        .andExpect(status().isOk());
  }
}
