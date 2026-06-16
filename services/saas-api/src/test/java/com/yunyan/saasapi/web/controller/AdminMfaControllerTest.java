package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = "/sql/auth-test-seed.sql")
class AdminMfaControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Test
  void mfaStatus_withoutToken_returnsUnauthorized() throws Exception {
    mockMvc.perform(get("/v1/admin/mfa/status")).andExpect(status().isUnauthorized());
  }

  @Test
  void mfaStatus_withTenantAdmin_returnsForbidden() throws Exception {
    var accessToken = loginAccessToken("admin@test.local");

    mockMvc
        .perform(get("/v1/admin/mfa/status").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isForbidden());
  }

  @Test
  void mfaStatus_withPlatformAdmin_returnsSkeletonStatus() throws Exception {
    var accessToken = loginAccessToken("platform@test.local");

    mockMvc
        .perform(get("/v1/admin/mfa/status").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enforcementEnabled").value(false))
        .andExpect(jsonPath("$.totpEnrollmentAvailable").value(false))
        .andExpect(jsonPath("$.enrolled").value(false))
        .andExpect(jsonPath("$.verifiedAt").isEmpty());
  }

  private String loginAccessToken(String email) throws Exception {
    return JsonPath.read(loginBody(email), "$.accessToken");
  }

  private String loginBody(String email) throws Exception {
    return mockMvc
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
  }
}
