package com.yunyan.saasapi.web.controller;

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
class AuthMfaLoginControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Autowired
  TotpSupport totpSupport;

  @Test
  void login_withEnrolledPlatformAdmin_returnsMfaChallenge() throws Exception {
    enrollPlatformAdminTotp();

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "platform@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.mfaRequired").value(true))
        .andExpect(jsonPath("$.mfaChallengeToken").isString())
        .andExpect(jsonPath("$.accessToken").isEmpty());
  }

  @Test
  void loginMfa_withValidCode_returnsTokens() throws Exception {
    var secret = enrollPlatformAdminTotp();

    var loginBody =
        mockMvc
            .perform(
                post("/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "email", "platform@test.local",
                                "password", "password",
                                "tenantId", "test"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var challengeToken = (String) JsonPath.read(loginBody, "$.mfaChallengeToken");
    var code = totpSupport.currentCode(secret);

    mockMvc
        .perform(
            post("/v1/auth/login/mfa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("mfaChallengeToken", challengeToken, "code", code))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isString())
        .andExpect(jsonPath("$.refreshToken").isString())
        .andExpect(jsonPath("$.mfaRequired").isEmpty());
  }

  private String enrollPlatformAdminTotp() throws Exception {
    var accessToken = loginAccessToken("platform@test.local");

    var enrollBody =
        mockMvc
            .perform(
                post("/v1/admin/mfa/totp/enroll")
                    .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
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
        .andExpect(status().isOk());

    return secret;
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
