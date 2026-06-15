package com.yunyan.billingapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.yunyan.billingapi.application.tenant.TenantMembershipService;
import com.yunyan.billingapi.security.InternalAuthFilter;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureMockRestServiceServer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;

@SpringBootTest
@AutoConfigureMockRestServiceServer
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "billing.membership-sync.source=api",
      "billing.membership-sync.saas-api-base-url=http://saas-api.test"
    })
class TenantMembershipApiSourceTest {

  @Autowired TenantMembershipService tenantMembershipService;

  @Autowired MockRestServiceServer mockServer;

  @Test
  void isTenantMember_delegatesToSaasApi() {
    var tenantId = UUID.fromString("11111111-1111-1111-1111-111111111101");
    var userId = UUID.fromString("22222222-2222-2222-2222-222222222201");

    mockServer
        .expect(
            requestTo(
                "http://saas-api.test/internal/v1/membership/tenants/"
                    + tenantId
                    + "/users/"
                    + userId))
        .andExpect(header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, "test-billing-internal-token"))
        .andExpect(header(InternalAuthFilter.CALLER_SERVICE_HEADER, "billing-api"))
        .andRespond(withSuccess("{\"member\":true,\"status\":\"active\"}", MediaType.APPLICATION_JSON));

    assertThat(tenantMembershipService.isTenantMember(tenantId, userId)).isTrue();
    mockServer.verify();
  }

  @Test
  void isTenantMember_apiReturnsFalse() {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();

    mockServer
        .expect(
            requestTo(
                "http://saas-api.test/internal/v1/membership/tenants/"
                    + tenantId
                    + "/users/"
                    + userId))
        .andRespond(withSuccess("{\"member\":false,\"status\":null}", MediaType.APPLICATION_JSON));

    assertThat(tenantMembershipService.isTenantMember(tenantId, userId)).isFalse();
  }
}
