package com.yunyan.saasapi.application.internal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.BillingMembershipSyncEventRepository;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.infrastructure.billing.BillingMembershipPushClient;
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
class MembershipSyncPushRetryServiceTest {

  @Autowired MembershipSyncPushRetryService membershipSyncPushRetryService;

  @Autowired MembershipSyncEventPublisher membershipSyncEventPublisher;

  @Autowired BillingMembershipSyncEventRepository eventRepository;

  @MockBean BillingMembershipPushClient billingMembershipPushClient;

  @Test
  void processPendingBatch_retriesUntilPushSucceeds() {
    when(billingMembershipPushClient.pushMembershipEvent(anyString(), anyString(), anyString()))
        .thenReturn(false, false, true);

    var user = new SysUser();
    user.setId(java.util.UUID.randomUUID());
    user.setTenantId(java.util.UUID.randomUUID());
    user.setEmail("retry@test.local");
    user.setStatus("active");

    membershipSyncEventPublisher.publishUserUpsert(user);
    assertThat(eventRepository.findPending(10)).hasSize(1);

    assertThat(membershipSyncPushRetryService.processPendingBatch()).isZero();
    assertThat(eventRepository.findPending(10)).hasSize(1);

    assertThat(membershipSyncPushRetryService.processPendingBatch()).isOne();
    assertThat(eventRepository.findPending(10)).isEmpty();
  }
}
