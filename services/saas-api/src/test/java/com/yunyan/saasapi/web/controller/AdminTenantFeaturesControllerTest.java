package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
      "/sql/admin-tenant-features-seed.sql"
    })
class AdminTenantFeaturesControllerTest {

  private static final UUID TEST_TENANT_ID =
      UUID.fromString("11111111-1111-1111-1111-111111111101");

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void featureCatalog_withPlatformAdmin_returnsCatalog() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/feature-catalog")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.features", hasSize(2)))
        .andExpect(jsonPath("$.features[*].code", hasItem("custom.highway-alert")));
  }

  @Test
  void getTenantFeatures_withPlatformAdmin_returnsSeededFeatures() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/tenants/" + TEST_TENANT_ID + "/features")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.featureCodes", hasSize(2)))
        .andExpect(jsonPath("$.featureCodes", hasItem("custom.highway-alert")));
  }

  @Test
  void updateTenantFeatures_withUnknownCode_returns400() throws Exception {
    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/features")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("featureCodes", List.of("custom.unknown")))))
        .andExpect(status().isBadRequest());
  }

  @Test
  void updateTenantFeatures_withPlatformAdmin_replacesFeatures() throws Exception {
    mockMvc
        .perform(
            put("/v1/admin/tenants/" + TEST_TENANT_ID + "/features")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        Map.of("featureCodes", List.of("custom.live-share")))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.featureCodes", hasSize(1)))
        .andExpect(jsonPath("$.featureCodes[0]").value("custom.live-share"));

    mockMvc
        .perform(
            get("/v1/tenants/" + TEST_TENANT_ID + "/features")
                .header("Authorization", "Bearer " + loginAccessToken("admin@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.features", hasSize(1)))
        .andExpect(jsonPath("$.features[0]").value("custom.live-share"));
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
