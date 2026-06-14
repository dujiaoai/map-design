package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.yunyan.billing.BillingClient;
import com.yunyan.billing.dto.EstimateResult;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(properties = {
  "saas.billing.enabled=true",
  "spring.profiles.active=test,dev"
})
@AutoConfigureMockMvc
@ActiveProfiles({"test", "dev"})
@Sql(scripts = "/sql/auth-test-seed.sql")
class DevBillingSmokeControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @MockBean
  BillingClient billingClient;

  @Test
  void smokeConsume_withAccessToken_returnsOk() throws Exception {
    when(billingClient.estimate(any())).thenReturn(new EstimateResult(1L, "点", 1L));
    when(billingClient.hold(any())).thenReturn(Optional.of("hold-test-id"));

    var accessToken = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            post("/v1/dev/billing/smoke-consume")
                .header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk());
  }

  private String loginAccessToken(String email) throws Exception {
    var response =
        mockMvc
            .perform(
                post("/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "email", email,
                                "password", "password",
                                "tenantId", "test"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return JsonPath.read(response, "$.accessToken");
  }
}
