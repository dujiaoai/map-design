package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.containsString;
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
@Sql(
    scripts = {
      "/sql/auth-test-seed.sql",
      "/sql/reset-role-permissions.sql",
      "/sql/tenant-quota-solo-seed.sql"
    })
class TenantQuotaSeatEnforcementTest {

  private static final UUID SOLO_TENANT_ID =
      UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void joinViaInviteLink_whenSeatLimitReached_returns403() throws Exception {
    var platformToken = loginAccessToken("platform@test.local");
    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + SOLO_TENANT_ID + "/invite-links")
                    .header("Authorization", "Bearer " + platformToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("roleCode", "MEMBER"))))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var inviteUrl = JsonPath.read(createBody, "$.inviteUrl").toString();
    var token = inviteUrl.substring(inviteUrl.indexOf("token=") + "token=".length());

    mockMvc
        .perform(
            post("/v1/auth/join-via-invite-link")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "token",
                            token,
                            "email",
                            "quota-full@test.local",
                            "password",
                            "Password1",
                            "displayName",
                            "Quota Full"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail", containsString("seat limit")));
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
