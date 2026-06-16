package com.yunyan.saasapi.web.dto.admin;

import java.util.List;

public record AdminMfaStatusResponse(
    boolean enforcementEnabled,
    boolean totpEnrollmentAvailable,
    boolean enrolled,
    Long verifiedAt,
    int recoveryCodesRemaining,
    List<String> recoveryCodes) {

  public AdminMfaStatusResponse(
      boolean enforcementEnabled,
      boolean totpEnrollmentAvailable,
      boolean enrolled,
      Long verifiedAt,
      int recoveryCodesRemaining) {
    this(
        enforcementEnabled,
        totpEnrollmentAvailable,
        enrolled,
        verifiedAt,
        recoveryCodesRemaining,
        null);
  }
}
