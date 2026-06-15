package com.yunyan.billingapi;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.security.InternalAuthFilter;
import com.yunyan.billingapi.web.dto.ApplyMembershipSyncEventsRequest;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "billing.membership-sync.push-receive-enabled=true")
class InternalMembershipMirrorControllerTest {

  private static final String INTERNAL_TOKEN = "test-billing-internal-token";

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @Autowired JdbcTemplate jdbcTemplate;

  @BeforeEach
  void ensureMirrorTables() {
    BillingTestMembershipSupport.ensureSchema(jdbcTemplate);
    jdbcTemplate.execute(
        """
        CREATE TABLE IF NOT EXISTS sys_tenant_feature (
            tenant_id UUID NOT NULL,
            feature_code VARCHAR(128) NOT NULL,
            PRIMARY KEY (tenant_id, feature_code)
        )
        """);
    jdbcTemplate.update("DELETE FROM sys_user");
  }

  @Test
  void applySyncEvents_pushesUserUpsertToMirror() throws Exception {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var payload =
        "{\"id\":\"%s\",\"tenantId\":\"%s\",\"email\":\"push@test.local\",\"status\":\"active\"}"
            .formatted(userId, tenantId);

    mockMvc
        .perform(
            post("/internal/v1/billing/membership/sync-events")
                .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
                .header(InternalAuthFilter.CALLER_SERVICE_HEADER, "saas-api")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    objectMapper.writeValueAsString(
                        new ApplyMembershipSyncEventsRequest(
                            List.of(
                                new ApplyMembershipSyncEventsRequest.MembershipSyncEventInput(
                                    UUID.randomUUID().toString(), "user_upsert", payload))))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.applied").value(1));

    var count =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_user WHERE id = ? AND email = ?",
            Integer.class,
            userId,
            "push@test.local");
    org.assertj.core.api.Assertions.assertThat(count).isEqualTo(1);
  }
}
