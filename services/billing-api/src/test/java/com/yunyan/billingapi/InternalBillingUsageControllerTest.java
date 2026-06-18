package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class InternalBillingUsageControllerTest {

  @Autowired MockMvc mockMvc;

  @Test
  void countEvents_withInternalToken_returnsZeroWhenEmpty() throws Exception {
    var from = Instant.parse("2026-01-01T00:00:00Z");
    var to = Instant.parse("2026-01-02T00:00:00Z");
    mockMvc
        .perform(
            get("/internal/v1/billing/usage/event-count")
                .param("from", from.toString())
                .param("to", to.toString())
                .header("X-Billing-Internal-Token", "test-billing-internal-token")
                .header("X-Billing-Caller-Service", "saas-api"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.eventCount").isNumber());
  }
}
