package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
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
import org.springframework.jdbc.core.JdbcTemplate;
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
class AdminUsersControllerTest {

  private static final UUID TEST_TENANT_ID =
      UUID.fromString("11111111-1111-1111-1111-111111111101");
  private static final UUID TENANT_ADMIN_USER_ID =
      UUID.fromString("22222222-2222-2222-2222-222222222201");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @Test
  void listUsers_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/admin/users")).andExpect(status().isUnauthorized());
  }

  @Test
  void listUsers_withTenantAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/users")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isForbidden());
  }

  @Test
  void listUsers_withPlatformAdmin_returnsSeededUsers() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/users")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.users", hasSize(3)))
        .andExpect(jsonPath("$.users[*].email", hasItem("admin@test.local")))
        .andExpect(jsonPath("$.users[*].roles", hasItem(java.util.List.of("TENANT_ADMIN"))));
  }

  @Test
  void listUsers_withTenantFilter_returnsTenantMembers() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/users")
                .param("tenantId", TEST_TENANT_ID.toString())
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.users", hasSize(3)))
        .andExpect(jsonPath("$.users[*].tenantSlug", hasItem("test")));
  }

  @Test
  void listUsers_withPagination_returnsPageMeta() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/users")
                .param("page", "1")
                .param("size", "1")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.users", hasSize(1)))
        .andExpect(jsonPath("$.total").value(3))
        .andExpect(jsonPath("$.page").value(1))
        .andExpect(jsonPath("$.size").value(1));
  }

  @Test
  void listUsers_withSearch_filtersByEmail() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/users")
                .param("q", "platform")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.users", hasSize(1)))
        .andExpect(jsonPath("$.users[0].email").value("platform@test.local"));
  }

  @Test
  void listUsers_withStatusFilter_returnsDisabledOnly() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/users")
                .param("status", "disabled")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.users", hasSize(1)))
        .andExpect(jsonPath("$.users[0].email").value("disabled@test.local"))
        .andExpect(jsonPath("$.users[0].status").value("disabled"));
  }

  @Test
  void inviteUser_withPlatformAdmin_returns201() throws Exception {
    var email = "invited-" + System.currentTimeMillis() + "@test.local";

    mockMvc
        .perform(
            post("/v1/admin/users")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "tenantId",
                            TEST_TENANT_ID.toString(),
                            "email",
                            email,
                            "roleCode",
                            "MEMBER"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value(email))
        .andExpect(jsonPath("$.status").value("invited"))
        .andExpect(jsonPath("$.roles[0]").value("MEMBER"));
  }

  @Test
  void inviteAndAcceptInvite_allowsLogin() throws Exception {
    var email = "accept-" + System.currentTimeMillis() + "@test.local";
    mockMvc
        .perform(
            post("/v1/admin/users")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "tenantId",
                            TEST_TENANT_ID.toString(),
                            "email",
                            email,
                            "roleCode",
                            "MEMBER"))))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.status").value("invited"));

    var payload =
        jdbcTemplate.queryForObject(
            "SELECT payload_json FROM sys_email_outbox WHERE to_email = ? ORDER BY created_at DESC LIMIT 1",
            String.class,
            email);
    var inviteUrl = objectMapper.readTree(payload).get("inviteUrl").asText();
    var token = inviteUrl.substring(inviteUrl.indexOf("token=") + "token=".length());

    mockMvc
        .perform(
            post("/v1/auth/accept-invite")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("token", token, "password", "newpassword1"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.user.email").value(email))
        .andExpect(jsonPath("$.accessToken").isNotEmpty());

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", email,
                            "password", "newpassword1",
                            "tenantId", "test"))))
        .andExpect(status().isOk());
  }

  @Test
  void inviteUser_duplicateEmail_returns409() throws Exception {
    mockMvc
        .perform(
            post("/v1/admin/users")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "tenantId",
                            TEST_TENANT_ID.toString(),
                            "email",
                            "admin@test.local",
                            "roleCode",
                            "MEMBER"))))
        .andExpect(status().isConflict());
  }

  @Test
  void resendInvite_withPlatformAdmin_queuesNewInviteEmail() throws Exception {
    var email = "resend-user-" + System.currentTimeMillis() + "@test.local";
    mockMvc
        .perform(
            post("/v1/admin/users")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "tenantId",
                            TEST_TENANT_ID.toString(),
                            "email",
                            email,
                            "roleCode",
                            "MEMBER"))))
        .andExpect(status().isCreated());

    var userId =
        jdbcTemplate.queryForObject(
            "SELECT id FROM sys_user WHERE email = ?", UUID.class, email);

    var countBefore =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'member-invite'",
            Integer.class,
            email);

    mockMvc
        .perform(
            post("/v1/admin/users/" + userId + "/resend-invite")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("invited"));

    var countAfter =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'member-invite'",
            Integer.class,
            email);
    if (countAfter <= countBefore) {
      throw new AssertionError("expected new member-invite outbox row after resend");
    }
  }

  @Test
  void resendInvite_forActiveUser_returns400() throws Exception {
    mockMvc
        .perform(
            post("/v1/admin/users/" + TENANT_ADMIN_USER_ID + "/resend-invite")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("User is not awaiting invite acceptance"));
  }

  @Test
  void patchUser_disableBlocksLogin() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            patch("/v1/admin/users/" + TENANT_ADMIN_USER_ID)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "disabled"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("disabled"));

    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value("Account is disabled"));
  }

  @Test
  void patchUser_disableRevokesRefreshToken() throws Exception {
    var victimLoginBody = loginBody("admin@test.local");
    var refreshToken = JsonPath.read(victimLoginBody, "$.refreshToken");

    mockMvc
        .perform(
            patch("/v1/admin/users/" + TENANT_ADMIN_USER_ID)
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("status", "disabled"))))
        .andExpect(status().isOk());

    var notificationCount =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'account-disabled'",
            Integer.class,
            "admin@test.local");
    org.junit.jupiter.api.Assertions.assertEquals(1, notificationCount);

    mockMvc
        .perform(
            post("/v1/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("refreshToken", refreshToken))))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void login_setsLastLoginAtOnUserList() throws Exception {
    mockMvc
        .perform(
            post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of(
                            "email", "admin@test.local",
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/v1/admin/users")
                .param("q", "admin@test.local")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.users[0].email").value("admin@test.local"))
        .andExpect(jsonPath("$.users[0].lastLoginAt").isNumber());
  }

  @Test
  void patchUser_emptyBody_returns400() throws Exception {
    mockMvc
        .perform(
            patch("/v1/admin/users/" + TENANT_ADMIN_USER_ID)
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
        .andExpect(status().isBadRequest());
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
