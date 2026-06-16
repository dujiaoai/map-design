package com.yunyan.saasapi.web.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
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
      "/sql/uav-docks-seed.sql"
    })
class UavDocksControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void list_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/uav/docks")).andExpect(status().isUnauthorized());
  }

  @Test
  void list_withAccessToken_returnsTenantDocks() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(get("/v1/uav/docks").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items", hasSize(3)))
        .andExpect(jsonPath("$.items[*].name", hasItem("机库-HZ-01")))
        .andExpect(jsonPath("$.items[*].status", hasItem("online")))
        .andExpect(jsonPath("$.items[0].batteryPercent").value(86));
  }

  @Test
  void list_doesNotReturnOtherTenantDocks() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(get("/v1/uav/docks").header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items[*].name", not(hasItem("第二租户机库"))));
  }

  @Test
  void get_byId_returnsDock() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(
            get("/v1/uav/docks/f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f102")
                .header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("机库-HZ-03"))
        .andExpect(jsonPath("$.droneCount").value(1));
  }

  @Test
  void get_otherTenantDock_returns404() throws Exception {
    var accessToken = loginAsTestAdmin();

    mockMvc
        .perform(
            get("/v1/uav/docks/f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f201")
                .header("Authorization", "Bearer " + accessToken))
        .andExpect(status().isNotFound());
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
