package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.yunyan.saasapi.security.mfa.TotpSupport;
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

  @Autowired
  TotpSupport totpSupport;

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
  void mfaStatus_withPlatformAdmin_returnsAvailableStatus() throws Exception {
    var accessToken = loginAccessToken("platform@test.local");

    mockMvc
        .perform(get("/v1/admin/mfa/status").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enforcementEnabled").value(false))
        .andExpect(jsonPath("$.totpEnrollmentAvailable").value(true))
        .andExpect(jsonPath("$.enrolled").value(false))
        .andExpect(jsonPath("$.verifiedAt").isEmpty());
  }

  @Test
  void totpEnrollVerifyDisable_roundTrip() throws Exception {
    var accessToken = loginAccessToken("platform@test.local");

    var enrollBody =
        mockMvc
            .perform(
                post("/v1/admin/mfa/totp/enroll")
                    .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.secret").isString())
            .andExpect(jsonPath("$.otpauthUri").isString())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var secret = (String) JsonPath.read(enrollBody, "$.secret");
    var code = totpSupport.currentCode(secret);

    mockMvc
        .perform(
            post("/v1/admin/mfa/totp/verify")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("code", code))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enrolled").value(true))
        .andExpect(jsonPath("$.verifiedAt").isNumber());

    var disableCode = totpSupport.currentCode(secret);
    mockMvc
        .perform(
            delete("/v1/admin/mfa/totp")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("code", disableCode))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enrolled").value(false));
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
