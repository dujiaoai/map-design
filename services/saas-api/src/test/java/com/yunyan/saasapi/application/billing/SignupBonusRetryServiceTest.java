package com.yunyan.saasapi.application.billing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.yunyan.billing.BillingClient;
import com.yunyan.saasapi.domain.BillingSignupBonusPendingRepository;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = "saas.billing.enabled=true")
@ActiveProfiles("test")
class SignupBonusRetryServiceTest {

  @Autowired SignupBonusRetryService signupBonusRetryService;

  @Autowired BillingSignupBonusPendingRepository signupBonusPendingRepository;

  @MockBean BillingClient billingClient;

  @Test
  void processPendingBatch_retriesUntilBillingApiSucceeds() {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    signupBonusPendingRepository.upsert(tenantId, userId, "personal", "initial failure");

    when(billingClient.grantSignupBonus(any())).thenReturn(false, true);

    assertThat(signupBonusRetryService.processPendingBatch()).isZero();
    assertThat(signupBonusPendingRepository.findRetryable(20, 10)).hasSize(1);

    assertThat(signupBonusRetryService.processPendingBatch()).isOne();
    assertThat(signupBonusPendingRepository.findRetryable(20, 10)).isEmpty();
  }
}
