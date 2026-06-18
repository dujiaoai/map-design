package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
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
class AuthTenantsControllerTest {

  private static final UUID TEST_TENANT_ID =
      UUID.fromString("11111111-1111-1111-1111-111111111101");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void tenantSso_withoutConfig_returnsDisabled() throws Exception {
    mockMvc
        .perform(get("/v1/auth/tenants/test/sso"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenantSlug").value("test"))
        .andExpect(jsonPath("$.enabled").value(false))
        .andExpect(jsonPath("$.loginAvailable").value(false));
  }

  @Test
  void tenantSso_afterAdminConfig_returnsAvailable() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            patch("/v1/admin/tenants/" + TEST_TENANT_ID + "/oidc-config")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "enabled", true,
                            "displayName", "Corp SSO",
                            "issuerUri", "https://idp.example.com",
                            "clientId", "corp-client",
                            "clientSecret", "corp-secret"))))
        .andExpect(status().isOk());

    mockMvc
        .perform(get("/v1/auth/tenants/test/sso"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enabled").value(true))
        .andExpect(jsonPath("$.loginAvailable").value(true))
        .andExpect(jsonPath("$.displayName").value("Corp SSO"));
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
