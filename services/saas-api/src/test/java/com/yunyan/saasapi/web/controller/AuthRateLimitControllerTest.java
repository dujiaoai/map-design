package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;
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
      "saas.rate-limit.login.ip-max-attempts=3",
      "saas.rate-limit.login.ip-window=PT1M",
      "saas.rate-limit.login.account-max-attempts=3",
      "saas.rate-limit.login.account-window=PT15M",
      "saas.rate-limit.register.ip-max-attempts=2",
      "saas.rate-limit.register.ip-window=PT1H",
      "saas.rate-limit.register.email-max-attempts=1",
      "saas.rate-limit.register.email-window=PT15M",
      "saas.rate-limit.password-reset.ip-max-attempts=2",
      "saas.rate-limit.password-reset.ip-window=PT1H",
      "saas.rate-limit.password-reset.email-max-attempts=1",
      "saas.rate-limit.password-reset.email-window=PT15M",
    })
@Sql(scripts = "/sql/auth-test-seed.sql")
class AuthRateLimitControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Test
  void login_afterRepeatedFailures_returns429WithRetryAfter() throws Exception {
    var body =
        objectMapper.writeValueAsString(
            Map.of(
                "email", "admin@test.local",
                "password", "wrong-password",
                "tenantId", "test"));

    for (var i = 0; i < 3; i++) {
      mockMvc
          .perform(post("/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
          .andExpect(status().isUnauthorized());
    }

    mockMvc
        .perform(post("/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isTooManyRequests())
        .andExpect(header().exists("Retry-After"))
        .andExpect(jsonPath("$.status").value(429))
        .andExpect(jsonPath("$.detail").value("Too many login attempts, try again later"));
  }

  @Test
  void register_repeatedEmail_returns429() throws Exception {
    var email = "ratelimit-" + System.currentTimeMillis() + "@test.local";
    var body =
        objectMapper.writeValueAsString(
            Map.of(
                "email", email,
                "password", "password1",
                "name", "Rate Limit",
                "tenantId", "test"));

    mockMvc
        .perform(post("/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(post("/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isTooManyRequests())
        .andExpect(jsonPath("$.detail").value("Too many registration attempts, try again later"));
  }

  @Test
  void passwordResetRequest_repeatedEmail_returns429() throws Exception {
    var body =
        objectMapper.writeValueAsString(
            Map.of("email", "admin@test.local", "tenantId", "test"));

    mockMvc
        .perform(
            post("/v1/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(
            post("/v1/auth/password-reset/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isTooManyRequests())
        .andExpect(jsonPath("$.detail").value("Too many password reset attempts, try again later"));
  }
}
