package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "billing.rate-limit.enabled=true",
      "billing.rate-limit.recharge.user-max-attempts=1",
      "billing.rate-limit.recharge.user-window=PT1H"
    })
class RechargeOrderRateLimitTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void createRechargeOrder_exceedsRateLimit_returns429() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var token =
        BillingJwtTestSupport.accessToken(
            userId,
            tenantId,
            List.of(
                PermissionCodes.BILLING_WALLET_READ,
                PermissionCodes.BILLING_RECHARGE_CREATE));

    var body =
        Map.of("packageCode", "starter_500", "channel", "wechat");

    mockMvc
        .perform(
            post("/v1/billing/recharge-orders")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/v1/billing/recharge-orders")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.status").value(429));
  }
}
