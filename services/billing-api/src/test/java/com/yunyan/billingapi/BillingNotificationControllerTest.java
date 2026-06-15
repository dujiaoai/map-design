package com.yunyan.billingapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BillingNotificationControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @BeforeEach
  void ensureMembershipSchema() {
    BillingTestMembershipSupport.ensureSchema(jdbcTemplate);
  }

  @Test
  void lowBalanceAndRefund_createNotifications() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var adminId = UUID.randomUUID();

    var userToken =
        BillingJwtTestSupport.accessToken(
            userId,
            tenantId,
            List.of(
                PermissionCodes.BILLING_WALLET_READ,
                PermissionCodes.BILLING_RECHARGE_CREATE));
    var adminAdjustToken =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_ADJUST));
    var adminRefundToken =
        BillingJwtTestSupport.accessToken(
            adminId, tenantId, List.of(PermissionCodes.ADMIN_BILLING_REFUND));

    BillingTestMembershipSupport.seedTenantMember(jdbcTemplate, tenantId, userId, "active");

    var orderNo = createAndPayOrder(userToken);

    mockMvc
        .perform(
            post("/v1/admin/billing/tenants/" + tenantId + "/adjust")
                .header("Authorization", "Bearer " + adminAdjustToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "userId",
                            userId.toString(),
                            "amount",
                            -460,
                            "remark",
                            "test low balance notify",
                            "idempotencyKey",
                            "adjust-low-balance-" + userId))))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/v1/billing/notifications").header("Authorization", "Bearer " + userToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[0].category").value("low_balance"))
        .andExpect(jsonPath("$.items[0].read").value(false));

    var orderNo2 = createAndPayOrder(userToken);

    mockMvc
        .perform(
            post("/v1/admin/billing/recharge-orders/" + orderNo2 + "/refund")
                .header("Authorization", "Bearer " + adminRefundToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "reason",
                            "test refund notify",
                            "idempotencyKey",
                            "refund-notify-" + orderNo2))))
        .andExpect(status().isOk());

    var notifications =
        mockMvc
            .perform(
                get("/v1/billing/notifications").header("Authorization", "Bearer " + userToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(2))
            .andReturn()
            .getResponse()
            .getContentAsString();

    assertThat(notifications).contains("recharge_refund");

    var notificationId = objectMapper.readTree(notifications).get("items").get(0).get("id").asText();

    mockMvc
        .perform(
            post("/v1/billing/notifications/" + notificationId + "/read")
                .header("Authorization", "Bearer " + userToken))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/v1/billing/notifications").header("Authorization", "Bearer " + userToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[0].read").value(true));
  }

  private String createAndPayOrder(String userToken) throws Exception {
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

    return orderNo;
  }
}
