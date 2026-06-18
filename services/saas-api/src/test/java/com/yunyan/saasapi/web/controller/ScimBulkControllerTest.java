package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
class ScimBulkControllerTest {

  @Autowired MockMvc mockMvc;

  @Test
  void bulk_withoutBearer_returns401() throws Exception {
    mockMvc
        .perform(
            post("/scim/v2/Bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"Operations\":[]}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @Sql(
      scripts = {
        "/sql/auth-test-seed.sql",
        "/sql/reset-role-permissions.sql",
        "/sql/scim-test-token.sql"
      })
  void bulk_createUser_returns201InOperations() throws Exception {
    mockMvc
        .perform(
            post("/scim/v2/Bulk")
                .header("Authorization", "Bearer scim-test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"schemas":["urn:ietf:params:scim:api:messages:2.0:BulkRequest"],"Operations":[{"method":"POST","path":"/Users","bulkId":"b1","data":{"externalId":"bulk-u1","userName":"bulk-u1@test.local","displayName":"Bulk User","active":true}}]}
                    """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.Operations[0].status").value("201"));
  }

  @Test
  @Sql(
      scripts = {
        "/sql/auth-test-seed.sql",
        "/sql/reset-role-permissions.sql",
        "/sql/scim-test-token.sql"
      })
  void bulk_exceedsMaxOperations_returns400() throws Exception {
    var ops = new StringBuilder("[");
    for (var i = 0; i < 21; i++) {
      if (i > 0) ops.append(',');
      ops.append(
          "{\"method\":\"POST\",\"path\":\"/Users\",\"bulkId\":\"b")
          .append(i)
          .append("\",\"data\":{\"userName\":\"u")
          .append(i)
          .append("@t.local\",\"active\":true}}");
    }
    ops.append(']');
    mockMvc
        .perform(
            post("/scim/v2/Bulk")
                .header("Authorization", "Bearer scim-test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"schemas\":[\"urn:ietf:params:scim:api:messages:2.0:BulkRequest\"],\"Operations\":"
                        + ops
                        + "}"))
        .andExpect(status().isBadRequest());
  }
}
