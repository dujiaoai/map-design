package com.yunyan.saasapi.application.billing;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SignupBonusRetryJob {

  private static final Logger log = LoggerFactory.getLogger(SignupBonusRetryJob.class);

  private final SignupBonusRetryService signupBonusRetryService;

  @Scheduled(fixedDelayString = "${saas.billing.signup-bonus-retry.scan-ms:300000}")
  public void retryPendingSignupBonuses() {
    var succeeded = signupBonusRetryService.processPendingBatch();
    if (succeeded > 0) {
      log.info("Processed {} pending signup bonus grant(s)", succeeded);
    }
  }
}
