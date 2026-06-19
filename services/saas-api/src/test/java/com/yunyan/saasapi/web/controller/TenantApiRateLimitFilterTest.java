package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.util.Map;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "saas.rate-limit.enabled=true",
      "saas.rate-limit.login.ip-max-attempts=100",
      "saas.rate-limit.login.account-max-attempts=100",
      "saas.rate-limit.tenant-api.enabled=true",
      "saas.rate-limit.tenant-api.max-per-minute-override=3",
    })
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Sql(scripts = "/sql/auth-test-seed.sql")
class TenantApiRateLimitFilterTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  @Order(1)
  void authenticatedApi_afterPlanLimit_returns429WithRetryAfter() throws Exception {
    var token = loginAccessToken();

    for (var i = 0; i < 3; i++) {
      mockMvc
          .perform(get("/v1/users/me").header("Authorization", "Bearer " + token))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.status").value(429))
        .andExpect(jsonPath("$.detail").value("Tenant API rate limit exceeded for current plan"));
  }

  @Test
  @Order(2)
  void authEndpoints_areNotTenantApiRateLimited() throws Exception {
    var body =
        objectMapper.writeValueAsString(
            Map.of(
                "email", "admin@test.local",
                "password", "wrong-password",
                "tenantId", "test"));

    for (var i = 0; i < 5; i++) {
      mockMvc
          .perform(post("/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
          .andExpect(status().isUnauthorized());
    }
  }

  @Test
  @Order(3)
  void adminEndpoints_areNotTenantApiRateLimited() throws Exception {
    var token = loginPlatformAccessToken();

    for (var i = 0; i < 5; i++) {
      mockMvc
          .perform(get("/v1/admin/tenants").header("Authorization", "Bearer " + token))
          .andExpect(status().isOk());
    }
  }

  private String loginPlatformAccessToken() throws Exception {
    var body =
        objectMapper.writeValueAsString(
            Map.of(
                "email", "platform@test.local",
                "password", "password",
                "tenantId", "test"));
    var response =
        mockMvc
            .perform(post("/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return JsonPath.read(response, "$.accessToken");
  }

  private String loginAccessToken() throws Exception {
    var body =
        objectMapper.writeValueAsString(
            Map.of(
                "email", "admin@test.local",
                "password", "password",
                "tenantId", "test"));
    var response =
        mockMvc
            .perform(post("/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return JsonPath.read(response, "$.accessToken");
  }
}
