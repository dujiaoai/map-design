package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.application.payment.PaymentWebhookSignatureService;
import com.yunyan.billingapi.application.tenant.MembershipPushSignatureService;
import com.yunyan.billingapi.security.InternalAuthFilter;
import com.yunyan.billingapi.web.dto.ApplyMembershipSyncEventsRequest;
import java.util.List;
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
      "billing.membership-sync.push-receive-enabled=true",
      "billing.membership-sync.push-signature-verify-enabled=true",
      "billing.membership-sync.push-signature-hmac-secret=test-membership-push-hmac"
    })
class InternalMembershipMirrorControllerSignatureTest {

  private static final String INTERNAL_TOKEN = "test-billing-internal-token";
  private static final String HMAC_SECRET = "test-membership-push-hmac";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void applySyncEvents_withValidHmac_succeeds() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var payload =
        "{\"id\":\"%s\",\"tenantId\":\"%s\",\"email\":\"hmac@test.local\",\"status\":\"active\"}"
            .formatted(userId, tenantId);
    var rawBody =
        objectMapper.writeValueAsString(
            new ApplyMembershipSyncEventsRequest(
                List.of(
                    new ApplyMembershipSyncEventsRequest.MembershipSyncEventInput(
                        UUID.randomUUID().toString(), "user_upsert", payload))));
    var signature = PaymentWebhookSignatureService.signHmacSha256Hex(HMAC_SECRET, rawBody);

    mockMvc
        .perform(
            post("/internal/v1/billing/membership/sync-events")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .header(InternalAuthFilter.CALLER_SERVICE_HEADER, "saas-api")
                .header(MembershipPushSignatureService.SIGNATURE_HEADER, signature)
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.applied").value(1));
  }

  @Test
  void applySyncEvents_withInvalidHmac_returns401() throws Exception {
    var rawBody =
        objectMapper.writeValueAsString(
            new ApplyMembershipSyncEventsRequest(
                List.of(
                    new ApplyMembershipSyncEventsRequest.MembershipSyncEventInput(
                        UUID.randomUUID().toString(),
                        "user_upsert",
                        "{\"id\":\"x\",\"tenantId\":\"y\",\"email\":\"a@b.com\",\"status\":\"active\"}"))));

    mockMvc
        .perform(
            post("/internal/v1/billing/membership/sync-events")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .header(InternalAuthFilter.CALLER_SERVICE_HEADER, "saas-api")
                .header(MembershipPushSignatureService.SIGNATURE_HEADER, "deadbeef")
                .contentType(MediaType.APPLICATION_JSON)
                .content(rawBody))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value("Invalid membership push signature"));
  }
}
