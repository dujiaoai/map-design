package com.yunyan.billingapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.yunyan.billingapi.application.tenant.MembershipCdcSyncJob;
import com.yunyan.billingapi.application.tenant.MembershipMirrorCdcService;
import com.yunyan.billingapi.security.InternalAuthFilter;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureMockRestServiceServer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;

@SpringBootTest
@AutoConfigureMockRestServiceServer
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "billing.membership-sync.source=cdc",
      "billing.membership-sync.saas-api-base-url=http://saas-api.test",
      "spring.task.scheduling.enabled=false"
    })
class MembershipMirrorCdcServiceTest {

  @Autowired MembershipMirrorCdcService membershipMirrorCdcService;

  @MockBean MembershipCdcSyncJob membershipCdcSyncJob;

  @Autowired MockRestServiceServer mockServer;

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
    jdbcTemplate.update("DELETE FROM sys_tenant_feature");
  }

  @Test
  void syncPendingEvents_appliesUserUpsertAndAcks() {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var eventId = UUID.randomUUID();

    mockServer
        .expect(requestTo("http://saas-api.test/internal/v1/membership/sync-events?limit=100"))
        .andExpect(method(HttpMethod.GET))
        .andExpect(header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, "test-billing-internal-token"))
        .andRespond(
            withSuccess(
                """
                {
                  "items": [
                    {
                      "id": "%s",
                      "eventType": "user_upsert",
                      "payload": "{\\"id\\":\\"%s\\",\\"tenantId\\":\\"%s\\",\\"email\\":\\"cdc@test.local\\",\\"status\\":\\"active\\"}",
                      "createdAt": "2026-06-15T00:00:00Z"
                    }
                  ]
                }
                """
                    .formatted(eventId, userId, tenantId),
                MediaType.APPLICATION_JSON));

    mockServer
        .expect(requestTo("http://saas-api.test/internal/v1/membership/sync-events/ack"))
        .andExpect(method(HttpMethod.POST))
        .andRespond(withSuccess("{\"acknowledged\":1}", MediaType.APPLICATION_JSON));

    var applied = membershipMirrorCdcService.syncPendingEvents(100);
    assertThat(applied).isEqualTo(1);

    var count =
        jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM sys_user WHERE id = ? AND tenant_id = ?",
            Integer.class,
            userId,
            tenantId);
    assertThat(count).isEqualTo(1);
    mockServer.verify();
  }
}
