package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.yunyan.saasapi.security.mfa.TotpSupport;
import java.util.Map;
import java.util.UUID;
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
@Sql(scripts = {"/sql/auth-test-seed.sql", "/sql/reset-role-permissions.sql"})
class AdminImpersonationControllerTest {

  private static final UUID OTHER_TENANT_ID =
      UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired TotpSupport totpSupport;

  @Test
  void startImpersonation_withoutToken_returns401() throws Exception {
    mockMvc
        .perform(
            post("/v1/admin/impersonation")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("tenantId", OTHER_TENANT_ID.toString(), "reason", "support"))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void startImpersonation_withPlatformAdmin_returnsTokensAndAuditLog() throws Exception {
    var token = loginAccessToken("platform@test.local");

    var body =
        mockMvc
            .perform(
                post("/v1/admin/impersonation")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "tenantId", OTHER_TENANT_ID.toString(),
                                "reason", "customer support"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").isNotEmpty())
            .andExpect(jsonPath("$.refreshToken").isNotEmpty())
            .andExpect(jsonPath("$.user.tenant.id").value(OTHER_TENANT_ID.toString()))
            .andExpect(jsonPath("$.homeTenant.id").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var impersonationToken = JsonPath.read(body, "$.accessToken");

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isUnauthorized());

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + impersonationToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenant.id").value(OTHER_TENANT_ID.toString()))
        .andExpect(jsonPath("$.homeTenant.id").exists());

    mockMvc
        .perform(get("/v1/admin/audit-logs").header("Authorization", "Bearer " + impersonationToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.logs[*].action", hasItem("impersonation.start")));
  }

  @Test
  void startImpersonation_withEnrolledTotp_requiresValidCode() throws Exception {
    var secret = enrollPlatformAdminTotp();
    var token = completePlatformAdminLogin(secret);

    mockMvc
        .perform(
            post("/v1/admin/impersonation")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "tenantId", OTHER_TENANT_ID.toString(),
                            "reason", "customer support"))))
        .andExpect(status().isBadRequest());

    var code = totpSupport.currentCode(secret);

    mockMvc
        .perform(
            post("/v1/admin/impersonation")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "tenantId", OTHER_TENANT_ID.toString(),
                            "reason", "customer support",
                            "totpCode", code))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.tenant.id").value(OTHER_TENANT_ID.toString()));
  }

  @Test
  void stopImpersonation_clearsActAsTenant() throws Exception {
    var token = loginAccessToken("platform@test.local");

    var startBody =
        mockMvc
            .perform(
                post("/v1/admin/impersonation")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of(
                                "tenantId", OTHER_TENANT_ID.toString(),
                                "reason", "customer support"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var impersonationToken = JsonPath.read(startBody, "$.accessToken");

    var stopBody =
        mockMvc
            .perform(
                delete("/v1/admin/impersonation")
                    .header("Authorization", "Bearer " + impersonationToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.homeTenant").doesNotExist())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var stopToken = JsonPath.read(stopBody, "$.accessToken");

    var homeTenantId = JsonPath.read(startBody, "$.homeTenant.id");

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + stopToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenant.id").value(homeTenantId))
        .andExpect(jsonPath("$.homeTenant").doesNotExist());
  }

  private String loginAccessToken(String email) throws Exception {
    return JsonPath.read(loginBody(email), "$.accessToken");
  }

  private String completePlatformAdminLogin(String totpSecret) throws Exception {
    var loginBody = loginBody("platform@test.local");
    if (!Boolean.TRUE.equals(JsonPath.read(loginBody, "$.mfaRequired"))) {
      return JsonPath.read(loginBody, "$.accessToken");
    }
    var challengeToken = (String) JsonPath.read(loginBody, "$.mfaChallengeToken");
    var code = totpSupport.currentCode(totpSecret);
    var mfaBody =
        mockMvc
            .perform(
                post("/v1/auth/login/mfa")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of("mfaChallengeToken", challengeToken, "code", code))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return JsonPath.read(mfaBody, "$.accessToken");
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
}
