package com.yunyan.billingapi.application.tenant;

import com.yunyan.billingapi.application.payment.PaymentWebhookSignatureService;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class MembershipPushSignatureService {

  public static final String SIGNATURE_HEADER = "X-Billing-Membership-Push-Signature";

  private final BillingAppProperties billingAppProperties;

  public MembershipPushSignatureService(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
  }

  public void verifyIfEnabled(String rawBody, String signatureHeader) {
    if (!billingAppProperties.getMembershipSync().isPushSignatureVerifyEnabled()) {
      return;
    }
    var secret = billingAppProperties.getMembershipSync().getPushSignatureHmacSecret();
    if (!StringUtils.hasText(secret)) {
      throw AuthException.unauthorized("Membership push signature verify enabled but secret missing");
    }
    if (!StringUtils.hasText(signatureHeader)) {
      throw AuthException.unauthorized("Missing membership push signature");
    }
    var expected = PaymentWebhookSignatureService.signHmacSha256Hex(secret, rawBody != null ? rawBody : "");
    if (!constantTimeEquals(expected, signatureHeader.trim())) {
      throw AuthException.unauthorized("Invalid membership push signature");
    }
  }

  private static boolean constantTimeEquals(String left, String right) {
    if (left.length() != right.length()) {
      return false;
    }
    var mismatch = 0;
    for (var index = 0; index < left.length(); index++) {
      mismatch |= left.charAt(index) ^ right.charAt(index);
    }
    return mismatch == 0;
  }
}
