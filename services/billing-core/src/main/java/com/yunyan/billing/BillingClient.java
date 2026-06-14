package com.yunyan.billing;

import com.yunyan.billing.dto.EstimateResult;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.billing.dto.WalletHoldRequest;
import java.util.Optional;

/** HTTP client contract for billing-api internal endpoints (implemented by consumers). */
public interface BillingClient {

  Optional<String> hold(WalletHoldRequest request);

  void confirm(String holdId);

  void cancel(String holdId);

  EstimateResult estimate(WalletHoldRequest request);

  void grantSignupBonus(SignupBonusRequest request);
}
