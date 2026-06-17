package com.yunyan.billingapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.application.ops.BillingOpsAlertService;
import com.yunyan.billingapi.application.reconciliation.ReconciliationDailyAlertJob;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import java.time.LocalDate;
import java.time.ZoneOffset;
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
class ReconciliationDailyAlertJobTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired ReconciliationDailyAlertJob reconciliationDailyAlertJob;

  @Autowired BillingOpsAlertService opsAlertService;

  @Test
  void runForYesterday_balancedDay_doesNotCreateAlert() {
    reconciliationDailyAlertJob.runForYesterday();
    assertThat(opsAlertService.countOpenReconciliationAlerts()).isZero();
  }

  @Test
  void getReconciliationStatus_afterBalancedDay_returnsBalanced() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();
    var today = LocalDate.now(ZoneOffset.UTC);

    var adminToken =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_READ));
    var userToken =
        BillingJwtTestSupport.accessToken(
            userId,
            tenantId,
            List.of(
                PermissionCodes.BILLING_WALLET_READ,
                PermissionCodes.BILLING_RECHARGE_CREATE));

    var createBody =
        mockMvc
            .perform(
                post("/v1/billing/recharge-orders")
                    .header("Authorization", "Bearer " + userToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of("packageCode", "starter_500", "channel", "mock"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var orderNo = objectMapper.readTree(createBody).get("orderNo").asText();

    mockMvc
        .perform(
            post("/v1/billing/recharge-orders/" + orderNo + "/mock-pay")
                .header("Authorization", "Bearer " + userToken))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/v1/admin/billing/reconciliation/status")
                .param("date", today.toString())
                .header("Authorization", "Bearer " + adminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.checkedDate").value(today.toString()))
        .andExpect(jsonPath("$.balanced").value(true))
        .andExpect(jsonPath("$.discrepancyCount").value(0))
        .andExpect(jsonPath("$.openAlertCount").value(0));
  }
}
