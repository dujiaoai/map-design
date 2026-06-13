package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class AdminTenantInviteLinksControllerTest {

  private static final UUID TEST_TENANT_ID =
      UUID.fromString("11111111-1111-1111-1111-111111111101");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void createAndListInviteLink_withTenantAdmin_returns201() throws Exception {
    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/invite-links")
                    .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of("roleCode", "MEMBER", "label", "团队链接", "maxUses", 5))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.inviteUrl").isNotEmpty())
            .andExpect(jsonPath("$.link.roleCode").value("MEMBER"))
            .andExpect(jsonPath("$.link.status").value("active"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var linkId = JsonPath.read(createBody, "$.link.id");

    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/invite-links")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.links", hasSize(1)))
        .andExpect(jsonPath("$.links[0].id").value(linkId))
        .andExpect(jsonPath("$.links[0].label").value("团队链接"));
  }

  @Test
  void revokeInviteLink_withTenantAdmin_returns200() throws Exception {
    var createBody =
        mockMvc
            .perform(
                post("/v1/admin/tenants/" + TEST_TENANT_ID + "/invite-links")
                    .header("Authorization", "Bearer " + loginAccessToken("admin@test.local"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("roleCode", "VIEWER"))))
            .andExpect(status().isCreated())
            .andReturn()
            .getResponse()
            .getContentAsString();
    var linkId = JsonPath.read(createBody, "$.link.id");

    mockMvc
        .perform(
            delete("/v1/admin/tenants/" + TEST_TENANT_ID + "/invite-links/" + linkId)
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("revoked"));
  }

  @Test
  void createInviteLink_withoutToken_returns401() throws Exception {
    mockMvc
        .perform(
            post("/v1/admin/tenants/" + TEST_TENANT_ID + "/invite-links")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("roleCode", "MEMBER"))))
        .andExpect(status().isUnauthorized());
  }

  private String loginAccessToken(String email) throws Exception {
    var body =
        mockMvc
            .perform(
                post("/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        objectMapper.writeValueAsString(
                            Map.of("email", email, "password", "password", "tenantId", "test"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return JsonPath.read(body, "$.accessToken");
  }
}
