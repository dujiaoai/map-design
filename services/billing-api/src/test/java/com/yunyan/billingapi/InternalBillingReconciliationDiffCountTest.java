package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class InternalBillingReconciliationDiffCountTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void diffCount_returnsZeroWhenBalanced() throws Exception {
    mockMvc
        .perform(
            get("/internal/v1/billing/reconciliation/diff-count")
                .param("from", "2026-06-01T00:00:00Z")
                .param("to", "2026-06-02T00:00:00Z")
                .header("X-Billing-Internal-Token", "dev-billing-internal-token-change-me")
                .header("X-Billing-Caller-Service", "saas-api"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.diffCount").isNumber());
  }
}
