package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(
    scripts = {
      "/sql/auth-test-seed.sql",
      "/sql/tenants-multi-membership-seed.sql",
      "/sql/tenants-features-seed.sql"
    })
class TenantsControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Test
  void list_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/tenants")).andExpect(status().isUnauthorized());
  }

  private static final String TEST_TENANT_ID = "11111111-1111-1111-1111-111111111101";
  private static final String SECOND_TENANT_ID = "11111111-1111-1111-1111-111111111102";
  private static final String ORPHAN_TENANT_ID = "11111111-1111-1111-1111-111111111199";
  private static final String UNKNOWN_TENANT_ID = "99999999-9999-9999-9999-999999999999";

  @Test
  void features_withoutToken_returns401() throws Exception {
    mockMvc
        .perform(get("/v1/tenants/" + TEST_TENANT_ID + "/features"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void features_withAccessToken_returnsFeatureCodes() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(
            get("/v1/tenants/" + TEST_TENANT_ID + "/features")
                .header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenantId").value(TEST_TENANT_ID))
        .andExpect(jsonPath("$.features", hasSize(2)))
        .andExpect(jsonPath("$.features", hasItem("custom.highway-alert")))
        .andExpect(jsonPath("$.features", hasItem("custom.live-share")));
  }

  @Test
  void features_forAccessibleSecondTenant_returnsItsFeatures() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(
            get("/v1/tenants/" + SECOND_TENANT_ID + "/features")
                .header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.tenantId").value(SECOND_TENANT_ID))
        .andExpect(jsonPath("$.features", hasSize(1)))
        .andExpect(jsonPath("$.features[0]").value("custom.live-share"));
  }

  @Test
  void features_forOrphanTenant_returns403() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(
            get("/v1/tenants/" + ORPHAN_TENANT_ID + "/features")
                .header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isForbidden());
  }

  @Test
  void features_forUnknownTenant_returns404() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(
            get("/v1/tenants/" + UNKNOWN_TENANT_ID + "/features")
                .header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isNotFound());
  }

  @Test
  void list_withAccessToken_returnsMembershipTenants() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(get("/v1/tenants").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items", hasSize(2)))
        .andExpect(jsonPath("$.items[*].slug", hasItem("test")))
        .andExpect(jsonPath("$.items[*].slug", hasItem("second")))
        .andExpect(jsonPath("$.items[0].slug").value("second"))
        .andExpect(jsonPath("$.items[0].current").value(false))
        .andExpect(jsonPath("$.items[1].slug").value("test"))
        .andExpect(jsonPath("$.items[1].current").value(true));
  }

  private String loginAsTestAdmin() throws Exception {
    var loginBody =
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
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return JsonPath.read(loginBody, "$.accessToken");
  }
}
