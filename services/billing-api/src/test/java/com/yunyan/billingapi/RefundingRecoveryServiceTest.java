package com.yunyan.billingapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.application.admin.RefundingRecoveryService;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "billing.refund.stuck-minutes=0")
class RefundingRecoveryServiceTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired RefundingRecoveryService refundingRecoveryService;

  @Autowired BillingRechargeOrderMapper orderMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @Test
  void recoverStuckRefundingOrders_revertsOrderWithoutRefundLedger() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token =
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
                    .header("Authorization", "Bearer " + token)
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
                .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk());

    jdbcTemplate.update(
        "UPDATE billing_recharge_order SET status = 'refunding', updated_at = ? WHERE order_no = ?",
        java.sql.Timestamp.from(Instant.now().minusSeconds(120)),
        orderNo);

    var recovered = refundingRecoveryService.recoverStuckRefundingOrders();
    assertThat(recovered).isEqualTo(1);

    var order = orderMapper.findByOrderNo(orderNo);
    assertThat(order.getStatus()).isEqualTo("paid");
  }
}
