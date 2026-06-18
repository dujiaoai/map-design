package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Sql(scripts = {"/sql/auth-test-seed.sql", "/sql/reset-role-permissions.sql"})
class ScimUsersControllerTest {

  @Autowired MockMvc mockMvc;

  @Test
  void listUsers_withoutBearer_returns401() throws Exception {
    mockMvc.perform(get("/scim/v2/Users")).andExpect(status().isUnauthorized());
  }

  @Test
  void listUsers_withInvalidBearer_returns401() throws Exception {
    mockMvc
        .perform(get("/scim/v2/Users").header("Authorization", "Bearer invalid-token"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @Sql(
      scripts = {
        "/sql/auth-test-seed.sql",
        "/sql/reset-role-permissions.sql",
        "/sql/scim-test-token.sql"
      })
  void listUsers_withValidBearer_returnsEmptyList() throws Exception {
    mockMvc
        .perform(get("/scim/v2/Users").header("Authorization", "Bearer scim-test-token"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalResults").value(0))
        .andExpect(jsonPath("$.Resources").isArray());
  }

  @Test
  @Sql(
      scripts = {
        "/sql/auth-test-seed.sql",
        "/sql/reset-role-permissions.sql",
        "/sql/scim-test-token.sql"
      })
  void createUser_withValidBearer_returnsResource() throws Exception {
    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/scim/v2/Users")
                .header("Authorization", "Bearer scim-test-token")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"externalId":"scim-ext-1","userName":"scim-new@test.local","displayName":"SCIM New","active":true}
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.userName").value("scim-new@test.local"));
  }
}
