package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.application.payment.PaymentWebhookService;
import com.yunyan.billingapi.web.dto.PaymentWebhookPayload;
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
      "billing.rate-limit.webhook.ip-max-attempts=2",
      "billing.rate-limit.webhook.ip-window=PT1M"
    })
class PaymentWebhookRateLimitTest {

  private static final String WEBHOOK_TOKEN = "test-billing-webhook-token";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void webhook_exceedsIpLimit_returns429WithRetryAfter() throws Exception {
    var payload = new PaymentWebhookPayload("RO-NOPE", "wx_trade_123", true, 4900L);
    var body = objectMapper.writeValueAsString(payload);

    mockMvc
        .perform(
            post("/v1/billing/webhooks/wechat")
                .header(PaymentWebhookService.WEBHOOK_TOKEN_HEADER, WEBHOOK_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isNotFound());

    mockMvc
        .perform(
            post("/v1/billing/webhooks/wechat")
                .header(PaymentWebhookService.WEBHOOK_TOKEN_HEADER, WEBHOOK_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isNotFound());

    mockMvc
        .perform(
            post("/v1/billing/webhooks/wechat")
                .header(PaymentWebhookService.WEBHOOK_TOKEN_HEADER, WEBHOOK_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.status").value(429));
  }
}
