package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
class AdminAuditLogsControllerTest {

  private static final UUID OTHER_TENANT_ID =
      UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void listAuditLogs_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/admin/audit-logs")).andExpect(status().isUnauthorized());
  }

  @Test
  void listAuditLogs_withTenantAdmin_returns403() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/audit-logs")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isForbidden());
  }

  @Test
  @Sql(
      scripts = {
        "/sql/auth-test-seed.sql",
        "/sql/reset-role-permissions.sql",
        "/sql/revoke-platform-audit-permissions.sql"
      })
  void listAuditLogs_withTenantsReadOnly_returns403() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(get("/v1/admin/tenants").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk());

    mockMvc
        .perform(get("/v1/admin/audit-logs").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
  }

  @Test
  void listAuditLogs_withSortParams_returnsOk() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/audit-logs")
                .param("page", "1")
                .param("size", "10")
                .param("sortBy", "action")
                .param("sortDir", "asc")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.logs").isArray());
  }

  @Test
  void crossTenantInviteLinkCreate_writesAuditLogWithCrossTenantFlag() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            post("/v1/admin/tenants/" + OTHER_TENANT_ID + "/invite-links")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("roleCode", "MEMBER"))))
        .andExpect(status().isCreated());

    mockMvc
        .perform(get("/v1/admin/audit-logs").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.logs[*].action", hasItem("member.invite-link.create")))
        .andExpect(
            jsonPath("$.logs[?(@.action=='member.invite-link.create')].crossTenant", hasItem(true)));
  }

  @Test
  void listAuditLogs_filterByTenantId_returnsMatchingLogs() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            post("/v1/admin/tenants/" + OTHER_TENANT_ID + "/invite-links")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("roleCode", "MEMBER"))))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            get("/v1/admin/audit-logs")
                .header("Authorization", "Bearer " + token)
                .param("tenantId", OTHER_TENANT_ID.toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.logs[*].action", hasItem("member.invite-link.create")))
        .andExpect(
            jsonPath(
                    "$.logs[?(@.targetTenantId=='"
                        + OTHER_TENANT_ID
                        + "')].action",
                    hasItem("member.invite-link.create")));
  }

  @Test
  void exportAuditLogs_returnsCsvAttachment() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            post("/v1/admin/tenants/" + OTHER_TENANT_ID + "/invite-links")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("roleCode", "MEMBER"))))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            get("/v1/admin/audit-logs/export")
                .header("Authorization", "Bearer " + token)
                .accept("text/csv"))
        .andExpect(status().isOk())
        .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")))
        .andExpect(content().string(startsWith("\uFEFF")));
  }

  @Test
  void exportAuditLogs_writesAuditExportAction() throws Exception {
    var token = loginAccessToken("platform@test.local");

    mockMvc
        .perform(
            get("/v1/admin/audit-logs/export")
                .header("Authorization", "Bearer " + token)
                .accept("text/csv"))
        .andExpect(status().isOk());

    mockMvc
        .perform(get("/v1/admin/audit-logs").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.logs[*].action", hasItem("audit.export")));
  }

  @Test
  void webhookConfig_withPlatformAdmin_returnsCsvOnlyByDefault() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/audit-logs/webhook-config")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.enabled").value(false))
        .andExpect(jsonPath("$.configured").value(false))
        .andExpect(jsonPath("$.format").value("jsonl"))
        .andExpect(jsonPath("$.deliveryMode").value("csv_only"));
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
