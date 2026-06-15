package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.application.payment.PaymentWebhookService;
import com.yunyan.billingapi.application.payment.PaymentWebhookSignatureService;
import com.yunyan.billingapi.application.payment.RsaSignatureSupport;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.web.dto.PaymentWebhookPayload;
import java.security.KeyPair;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentWebhookAlipayRsaSignatureTest {

  private static final String WEBHOOK_TOKEN = "test-billing-webhook-token";
  private static final KeyPair RSA_KEY_PAIR = BillingWebhookRsaTestSupport.generateRsaKeyPair();

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @DynamicPropertySource
  static void webhookProperties(DynamicPropertyRegistry registry) {
    registry.add("billing.webhook.signature-verify-enabled", () -> "true");
    registry.add("billing.webhook.alipay-signature-mode", () -> "alipay_rsa");
    registry.add(
        "billing.webhook.alipay-public-key-pem",
        () -> BillingWebhookRsaTestSupport.toPublicKeyPem(RSA_KEY_PAIR));
  }

  @Test
  void alipayWebhook_validRsaSignature_creditsWallet() throws Exception {
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
                            Map.of("packageCode", "starter_500", "channel", "alipay"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var orderNo = objectMapper.readTree(createBody).get("orderNo").asText();
    var rawBody =
        objectMapper.writeValueAsString(
            new PaymentWebhookPayload(orderNo, "alipay_trade_1", true, 4900L));
    var signature = RsaSignatureSupport.signSha256Rsa(RSA_KEY_PAIR.getPrivate(), rawBody);

    mockMvc
        .perform(
            post("/v1/billing/webhooks/alipay")
                .header(PaymentWebhookService.WEBHOOK_TOKEN_HEADER, WEBHOOK_TOKEN)
                .header(PaymentWebhookSignatureService.ALIPAY_SIGNATURE_HEADER, signature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value("SUCCESS"));
  }

  @Test
  void alipayWebhook_invalidRsaSignature_returns401() throws Exception {
    var rawBody =
        objectMapper.writeValueAsString(
            new PaymentWebhookPayload("RO-ALIPAY-1", "alipay_trade_1", true, 4900L));

    mockMvc
        .perform(
            post("/v1/billing/webhooks/alipay")
                .header(PaymentWebhookService.WEBHOOK_TOKEN_HEADER, WEBHOOK_TOKEN)
                .header(PaymentWebhookSignatureService.ALIPAY_SIGNATURE_HEADER, "invalid")
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawBody))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value("Invalid Alipay webhook signature"));
  }
}
