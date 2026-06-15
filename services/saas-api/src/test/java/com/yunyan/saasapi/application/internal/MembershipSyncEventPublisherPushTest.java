package com.yunyan.saasapi.application.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.BillingMembershipSyncEventRepository;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.infrastructure.billing.BillingMembershipPushClient;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(
    properties = {
      "saas.billing.enabled=true",
      "saas.billing.membership-sync.push-enabled=true"
    })
class MembershipSyncEventPublisherPushTest {

  @Autowired MembershipSyncEventPublisher membershipSyncEventPublisher;

  @Autowired BillingMembershipSyncEventRepository eventRepository;

  @MockBean BillingMembershipPushClient billingMembershipPushClient;

  @Test
  void publishUserUpsert_pushSuccess_marksEventProcessed() {
    when(billingMembershipPushClient.pushMembershipEvent(anyString(), anyString(), anyString()))
        .thenReturn(true);

    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var user = new SysUser();
    user.setId(userId);
    user.setTenantId(tenantId);
    user.setEmail("push-ack@test.local");
    user.setStatus("active");

    membershipSyncEventPublisher.publishUserUpsert(user);

    assertThat(eventRepository.findPending(10)).isEmpty();
    verify(billingMembershipPushClient)
        .pushMembershipEvent(anyString(), org.mockito.ArgumentMatchers.eq("user_upsert"), anyString());
  }
}
