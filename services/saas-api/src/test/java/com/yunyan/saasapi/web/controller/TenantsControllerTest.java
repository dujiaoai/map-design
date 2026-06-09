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
@Sql(scripts = {"/sql/auth-test-seed.sql", "/sql/tenants-multi-membership-seed.sql"})
class TenantsControllerTest {

  @Autowired
  MockMvc mockMvc;

  @Autowired
  ObjectMapper objectMapper;

  @Test
  void list_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/tenants")).andExpect(status().isUnauthorized());
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
