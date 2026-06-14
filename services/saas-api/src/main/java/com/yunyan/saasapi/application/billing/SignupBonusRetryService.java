package com.yunyan.saasapi.application.billing;

import com.yunyan.billing.BillingClient;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.saasapi.config.BillingApiProperties;
import com.yunyan.saasapi.domain.BillingSignupBonusPendingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SignupBonusRetryService {

  private static final int BATCH_SIZE = 20;

  private final BillingApiProperties billingApiProperties;
  private final BillingClient billingClient;
  private final BillingSignupBonusPendingRepository signupBonusPendingRepository;

  public int processPendingBatch() {
    if (!billingApiProperties.isEnabled()) {
      return 0;
    }

    var maxAttempts = billingApiProperties.getSignupBonusRetry().getMaxAttempts();
    var pending = signupBonusPendingRepository.findRetryable(maxAttempts, BATCH_SIZE);
    var succeeded = 0;

    for (var row : pending) {
      var request =
          new SignupBonusRequest(row.getTenantId(), row.getUserId(), row.getTenantKind());
      if (billingClient.grantSignupBonus(request)) {
        signupBonusPendingRepository.delete(row.getTenantId(), row.getUserId());
        succeeded++;
        log.info(
            "Signup bonus retry succeeded for tenant={} user={}",
            row.getTenantId(),
            row.getUserId());
      } else {
        signupBonusPendingRepository.recordFailure(
            row.getId(), "billing-api signup-bonus retry failed");
      }
    }

    return succeeded;
  }
}
