package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.lessThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = "/sql/auth-test-seed.sql")
class UsersControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Autowired
  JdbcTemplate jdbcTemplate;

  @Test
  void me_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/users/me")).andExpect(status().isUnauthorized());
  }

  @Test
  void me_withInvalidToken_returns401() throws Exception {
    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer not-a-jwt"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void me_withAccessToken_returnsSessionDtoWithRolesTenantAndExpiresAt() throws Exception {
    var accessToken = loginAccessToken();

    var now = System.currentTimeMillis();
    var maxExpiresAt = now + 16 * 60 * 1000L;

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.id").value("22222222-2222-2222-2222-222222222201"))
        .andExpect(jsonPath("$.user.email").value("admin@test.local"))
        .andExpect(jsonPath("$.user.name").value("Test Admin"))
        .andExpect(jsonPath("$.user.roles", hasItem("TENANT_ADMIN")))
        .andExpect(jsonPath("$.user.permissions", hasItem("workspace:use")))
        .andExpect(jsonPath("$.user.permissions", hasItem("admin:members:read")))
        .andExpect(jsonPath("$.user.permissions", hasItem("workspace:map:write")))
        .andExpect(jsonPath("$.tenant.id").value("11111111-1111-1111-1111-111111111101"))
        .andExpect(jsonPath("$.tenant.name").value("Test Tenant"))
        .andExpect(jsonPath("$.tenant.slug").value("test"))
        .andExpect(jsonPath("$.expiresAt").isNumber())
        .andExpect(jsonPath("$.expiresAt").value(greaterThan(now)))
        .andExpect(jsonPath("$.expiresAt").value(lessThan(maxExpiresAt)))
        .andExpect(jsonPath("$.accessToken").doesNotExist());
  }

  @Test
  void me_withRefreshToken_returns401() throws Exception {
    var loginBody = loginBody();
    var refreshToken = JsonPath.read(loginBody, "$.refreshToken");

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + refreshToken))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void changePassword_withoutToken_returns401() throws Exception {
    mockMvc
        .perform(
            post("/v1/users/me/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("oldPassword", "password", "newPassword", "newpassword"))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void changePassword_withWrongOldPassword_returns401() throws Exception {
    var accessToken = loginAccessToken();

    mockMvc
        .perform(
            post("/v1/users/me/password")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("oldPassword", "wrong", "newPassword", "newpassword"))))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.detail").value("Current password is incorrect"));
  }

  @Test
  void changePassword_withValidPassword_updatesAndRevokesRefresh() throws Exception {
    var email = "pwd-" + System.currentTimeMillis() + "@test.local";
    var tokens = registerAndConfirm(email, "password");
    var accessToken = tokens.accessToken();
    var refreshToken = tokens.refreshToken();

    mockMvc
        .perform(
            post("/v1/users/me/password")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "oldPassword", "password",
                            "newPassword", "newpassword"))))
        .andExpect(status().isNoContent());

    var notificationCount =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'password-changed'",
            Integer.class,
            email);
    org.junit.jupiter.api.Assertions.assertEquals(1, notificationCount);

    mockMvc
        .perform(
            post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
        .andExpect(status().isUnauthorized());

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "newpassword",
                            "tenantId", "test"))))
        .andExpect(status().isOk());
  }

  @Test
  void updateMe_withoutToken_returns401() throws Exception {
    mockMvc
        .perform(
            put("/v1/users/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "New Name"))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void updateMe_withValidName_persistsAndReturnsSession() throws Exception {
    var accessToken = loginAccessToken();

    mockMvc
        .perform(
            put("/v1/users/me")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", "Renamed Admin"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.name").value("Renamed Admin"))
        .andExpect(jsonPath("$.user.email").value("admin@test.local"))
        .andExpect(jsonPath("$.tenant.slug").value("test"))
        .andExpect(jsonPath("$.expiresAt").isNumber());

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.name").value("Renamed Admin"));
  }

  @Test
  void updateMe_withPhoneAndAvatarUrl_persistsFields() throws Exception {
    var accessToken = loginAccessToken();

    mockMvc
        .perform(
            put("/v1/users/me")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "name", "Profile User",
                            "phone", "13800138000",
                            "avatarUrl", "https://cdn.example/avatar.png"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.name").value("Profile User"))
        .andExpect(jsonPath("$.user.phone").value("13800138000"))
        .andExpect(jsonPath("$.user.avatarUrl").value("https://cdn.example/avatar.png"));
  }

  @Test
  void updateMe_withInvalidPhone_returns400() throws Exception {
    var accessToken = loginAccessToken();

    mockMvc
        .perform(
            put("/v1/users/me")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("name", "Profile User", "phone", "12345"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Invalid phone number format"));
  }

  @Test
  void updateMe_withBlankName_returns400() throws Exception {
    var accessToken = loginAccessToken();

    mockMvc
        .perform(
            put("/v1/users/me")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", ""))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.title").value("Validation failed"));
  }

  @Test
  void me_afterRegister_returnsMemberSession() throws Exception {
    var email = "me-register-" + System.currentTimeMillis() + "@test.local";
    var accessToken = registerAndConfirm(email, "password").accessToken();

    mockMvc
        .perform(get("/v1/users/me").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value(email))
        .andExpect(jsonPath("$.user.roles", hasItem("MEMBER")))
        .andExpect(jsonPath("$.user.permissions", hasItem("workspace:use")))
        .andExpect(jsonPath("$.user.permissions", hasItem("workspace:map:write")))
        .andExpect(jsonPath("$.tenant.slug").value("test"))
        .andExpect(jsonPath("$.expiresAt").isNumber());
  }

  private String loginAccessToken() throws Exception {
    return JsonPath.read(loginBody(), "$.accessToken");
  }

  private RegisterTokens registerAndConfirm(String email, String password) throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("email", email, "password", password, "tenantId", "test"))))
        .andExpect(status().isNoContent());

    var payload =
        jdbcTemplate.queryForObject(
            "SELECT payload_json FROM sys_email_outbox WHERE to_email = ? AND template = 'register-verification' ORDER BY created_at DESC LIMIT 1",
            String.class,
            email);
    var verifyUrl = objectMapper.readTree(payload).get("verifyUrl").asText();
    var token = verifyUrl.substring(verifyUrl.indexOf("token=") + "token=".length());

    var confirmBody =
        mockMvc
            .perform(
                post("/v1/auth/register/confirm")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("token", token))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    return new RegisterTokens(
        JsonPath.read(confirmBody, "$.accessToken"), JsonPath.read(confirmBody, "$.refreshToken"));
  }

  private record RegisterTokens(String accessToken, String refreshToken) {}

  private String loginBody() throws Exception {
    return mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();
  }
}
