package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.yunyan.saasapi.security.BillingInternalAuthFilter;
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
@Sql(scripts = "/sql/auth-test-seed.sql")
class InternalMembershipControllerTest {

  private static final String INTERNAL_TOKEN = "test-billing-internal-token";

  @Autowired MockMvc mockMvc;

  @Test
  void checkMembership_withoutToken_returns401() throws Exception {
    mockMvc
        .perform(
            get(
                "/internal/v1/membership/tenants/11111111-1111-1111-1111-111111111101/users/22222222-2222-2222-2222-222222222201"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void checkMembership_validMember_returnsMemberTrue() throws Exception {
    mockMvc
        .perform(
            get(
                    "/internal/v1/membership/tenants/11111111-1111-1111-1111-111111111101/users/22222222-2222-2222-2222-222222222201")
                .header(BillingInternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.member").value(true))
        .andExpect(jsonPath("$.status").value("active"));
  }

  @Test
  void checkMembership_wrongTenant_returnsMemberFalse() throws Exception {
    mockMvc
        .perform(
            get(
                    "/internal/v1/membership/tenants/99999999-9999-9999-9999-999999999901/users/22222222-2222-2222-2222-222222222201")
                .header(BillingInternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.member").value(false));
  }
}
