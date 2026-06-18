package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ScimGroupsControllerTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void listGroups_withoutToken_isUnauthorized() throws Exception {
    mockMvc.perform(get("/scim/v2/Groups")).andExpect(status().isUnauthorized());
  }

  @Test
  void createGroup_withoutToken_isUnauthorized() throws Exception {
    mockMvc
        .perform(
            post("/scim/v2/Groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"displayName\":\"Engineering\"}"))
        .andExpect(status().isUnauthorized());
  }
}
