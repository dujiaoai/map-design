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
      "/sql/reset-role-permissions.sql",
    })
class AdminProductsControllerTest {

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Test
  void listProducts_withoutToken_returns401() throws Exception {
    mockMvc.perform(get("/v1/admin/products")).andExpect(status().isUnauthorized());
  }

  @Test
  void listProducts_withPlatformAdmin_returnsMapDesign() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/products")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.products", hasSize(1)))
        .andExpect(jsonPath("$.products[*].code", hasItem("map-design")));
  }

  @Test
  void getProduct_byCode_returnsDetail() throws Exception {
    mockMvc
        .perform(
            get("/v1/admin/products/map-design")
                .header("Authorization", "Bearer " + loginAccessToken("platform@test.local")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.code").value("map-design"))
        .andExpect(jsonPath("$.name").value("地图工作台"));
  }

  private String loginAccessToken(String email) throws Exception {
    var response =
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
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    return JsonPath.read(response, "$.accessToken");
  }
}
