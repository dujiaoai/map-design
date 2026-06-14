package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BillingApiApplicationTest {

  @Autowired
  MockMvc mockMvc;

  @Test
  void ping_returnsOkJson() throws Exception {
    mockMvc
        .perform(get("/v1/ping"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("ok"))
        .andExpect(jsonPath("$.service").value("billing-api"));
  }
}
