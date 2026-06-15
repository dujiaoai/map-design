package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthExceptionProblemDetailTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void authException_returnsProblemDetail() throws Exception {
    mockMvc
        .perform(
            post("/v1/billing/webhooks/wechat")
                .header(PaymentWebhookService.WEBHOOK_TOKEN_HEADER, "wrong")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        new PaymentWebhookPayload("RO-NOPE", "wx_trade_123", true, 4900L))))
        .andExpect(status().isUnauthorized())
        .andExpect(content().contentType("application/problem+json"))
        .andExpect(jsonPath("$.title").value("Unauthorized"))
        .andExpect(jsonPath("$.detail").value("Invalid webhook token"))
        .andExpect(jsonPath("$.status").value(401))
        .andExpect(jsonPath("$.type").value("urn:yunyan:billing:api_error"));
  }
}
