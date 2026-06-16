package com.yunyan.saasapi.web.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
@Sql(scripts = {"/sql/auth-test-seed.sql", "/sql/reset-role-permissions.sql"})
class AdminTenantMembersControllerTest {

  private static final UUID TEST_TENANT_ID =
      UUID.fromString("11111111-1111-1111-1111-111111111101");
  private static final UUID OTHER_TENANT_ID =
      UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @Test
  void listMembers_withoutToken_returns401() throws Exception {
    mockMvc
        .perform(get("/v1/admin/tenants/" + TEST_TENANT_ID + "/members"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void listMembers_withPlatformAdmin_crossTenant_returnsMembers() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + OTHER_TENANT_ID + "/members")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.members", hasSize(1)))
        .andExpect(jsonPath("$.members[*].email", hasItem("other@test.local")));
  }

  @Test
  void listMembers_withTenantAdmin_returnsMembers() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/members")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.members", hasSize(3)))
        .andExpect(jsonPath("$.members[*].email", hasItem("admin@test.local")))
        .andExpect(jsonPath("$.members[*].email", hasItem("disabled@test.local")));
  }

  @Test
  void listMembers_withSortAndFilterParams_returnsOk() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/members")
                .param("sortBy", "email")
                .param("sortDir", "asc")
                .param("status", "active")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.members").isArray());
  }

  @Test
  void listMembers_withWrongTenant_returns403() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + OTHER_TENANT_ID + "/members")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isForbidden());
  }

  @Test
  void updateMemberRoles_withTenantAdmin_returnsUpdatedRoles() throws Exception {
    var email = "roles-" + System.currentTimeMillis() + "@test.local";
    var userId = createMemberViaInviteLink(email, "password");

    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/" + userId + "/roles")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("roleCodes", List.of("VIEWER")))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.roles[0]").value("VIEWER"));
  }

  @Test
  void updateMemberRoles_platformAdminRole_returns400() throws Exception {
    var email = "badrole-" + System.currentTimeMillis() + "@test.local";
    var userId = createMemberViaInviteLink(email, "password");

    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/" + userId + "/roles")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("roleCodes", List.of("PLATFORM_ADMIN")))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void patchMember_disableBlocksLogin() throws Exception {
    var email = "disable-" + System.currentTimeMillis() + "@test.local";
    var userId = createMemberViaInviteLink(email, "password");

    mockMvc
        .perform(
            patch("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/" + userId)
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
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
                            "email", email,
                            "password", "password",
                            "tenantId", "test"))))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.detail").value("Account is disabled"));
  }

  @Test
  void inviteMemberByEmail_createsInvitedUserAndQueuesEmail() throws Exception {
    var email = "email-invite-" + System.currentTimeMillis() + "@test.local";

    var body =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/invite")
                    .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of("email", email, "displayName", "Email Invitee", "roleCode", "MEMBER"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.status").value("invited"))
            .andExpect(jsonPath("$.roles[0]").value("MEMBER"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var userId = JsonPath.read(body, "$.id").toString();
    var outboxCount =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'member-invite'",
            Integer.class,
            email);
    assertEquals(1, outboxCount);

    mockMvc
        .perform(
            post("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/" + userId + "/resend-invite")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("invited"));

    var resentCount =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_email_outbox WHERE to_email = ? AND template = 'member-invite'",
            Integer.class,
            email);
    assertTrue(resentCount >= 2);
  }

  @Test
  void inviteMemberByEmail_duplicateEmail_returns409() throws Exception {
    var email = "dup-invite-" + System.currentTimeMillis() + "@test.local";
    var payload =
        objectMapper.writeValueAsString(Map.of("email", email, "roleCode", "MEMBER"));

    mockMvc
        .perform(
            post("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/invite")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/v1/admin/tenants/" + TEST_TENANT_ID + "/members/invite")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
        .andExpect(status().isConflict());
  }

  private String createMemberViaInviteLink(String email, String password) throws Exception {
    var adminToken = loginAccessToken("admin@test.local");
    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/invite-links")
                    .header("Authorization", "Bearer " + adminToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("roleCode", "MEMBER"))))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var inviteUrl = JsonPath.read(createBody, "$.inviteUrl").toString();
    var token = inviteUrl.substring(inviteUrl.indexOf("token=") + "token=".length());

    var joinBody =
        mockMvc
            .perform(
                post("/v1/auth/join-via-invite-link")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of("token", token, "email", email, "password", password))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return JsonPath.read(joinBody, "$.user.id");
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
