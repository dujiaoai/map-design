package com.yunyan.saasapi.web.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.application.internal.MembershipSyncEventPublisher;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.BillingInternalAuthFilter;
import com.yunyan.saasapi.web.dto.internal.AckMembershipSyncEventsRequest;
import java.util.List;
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
@Sql(scripts = "/sql/auth-test-seed.sql")
class InternalMembershipSyncControllerTest {

  private static final String INTERNAL_TOKEN = "test-billing-internal-token";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired MembershipSyncEventPublisher membershipSyncEventPublisher;

  @Test
  void pullAndAckMembershipEvents() throws Exception {
    var tenantId = UUID.fromString("11111111-1111-1111-1111-111111111101");
    var userId = UUID.fromString("22222222-2222-2222-2222-222222222201");

    var user = new SysUser();
    user.setId(userId);
    user.setTenantId(tenantId);
    user.setEmail("cdc@test.local");
    user.setStatus("active");
    membershipSyncEventPublisher.publishUserUpsert(user);

    var listBody =
        mockMvc
            .perform(
                get("/internal/v1/membership/sync-events?limit=10")
                    .header(BillingInternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].eventType").value("user_upsert"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var eventId = objectMapper.readTree(listBody).get("items").get(0).get("id").asText();

    mockMvc
        .perform(
            post("/internal/v1/membership/sync-events/ack")
                .header(BillingInternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(new AckMembershipSyncEventsRequest(List.of(eventId)))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.acknowledged").value(1));

    mockMvc
        .perform(
            get("/internal/v1/membership/sync-events?limit=10")
                .header(BillingInternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.items.length()").value(0));
  }
}
