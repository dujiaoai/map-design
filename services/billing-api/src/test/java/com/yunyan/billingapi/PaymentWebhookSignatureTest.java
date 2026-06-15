package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.application.payment.PaymentWebhookService;
import com.yunyan.billingapi.application.payment.PaymentWebhookSignatureService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.web.dto.PaymentWebhookPayload;
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
      "billing.webhook.signature-verify-enabled=true",
      "billing.webhook.wechat-sign-secret=test-wechat-sign-secret"
    })
class PaymentWebhookSignatureTest {

  private static final String WEBHOOK_TOKEN = "test-billing-webhook-token";
  private static final String SIGN_SECRET = "test-wechat-sign-secret";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void wechatWebhook_validSignature_creditsWallet() throws Exception {
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
                            Map.of("packageCode", "starter_500", "channel", "wechat"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var orderNo = objectMapper.readTree(createBody).get("orderNo").asText();
    var rawBody =
        objectMapper.writeValueAsString(
            new PaymentWebhookPayload(orderNo, "wx_trade_sig", true, 4900L));
    var signature = PaymentWebhookSignatureService.sign(SIGN_SECRET, rawBody);

    mockMvc
        .perform(
            post("/v1/billing/webhooks/wechat")
                .header(PaymentWebhookService.WEBHOOK_TOKEN_HEADER, WEBHOOK_TOKEN)
                .header(PaymentWebhookSignatureService.SIGNATURE_HEADER, signature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value("SUCCESS"));
  }

  @Test
  void wechatWebhook_invalidSignature_returns401() throws Exception {
    var rawBody =
        objectMapper.writeValueAsString(
            new PaymentWebhookPayload("RO-NOPE", "wx_trade_sig", true, 4900L));

    mockMvc
        .perform(
            post("/v1/billing/webhooks/wechat")
                .header(PaymentWebhookService.WEBHOOK_TOKEN_HEADER, WEBHOOK_TOKEN)
                .header(PaymentWebhookSignatureService.SIGNATURE_HEADER, "deadbeef")
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawBody))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value("Invalid webhook signature"));
  }

  @Test
  void wechatWebhook_missingSignature_returns401() throws Exception {
    var rawBody =
        objectMapper.writeValueAsString(
            new PaymentWebhookPayload("RO-NOPE", "wx_trade_sig", true, 4900L));

    mockMvc
        .perform(
            post("/v1/billing/webhooks/wechat")
                .header(PaymentWebhookService.WEBHOOK_TOKEN_HEADER, WEBHOOK_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawBody))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value("Missing webhook signature"));
  }
}
