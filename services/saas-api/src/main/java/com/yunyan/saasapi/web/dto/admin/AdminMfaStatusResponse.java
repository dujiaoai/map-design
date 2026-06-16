package com.yunyan.saasapi.web.dto.admin;

public record AdminMfaStatusResponse(
    boolean enforcementEnabled,
    boolean totpEnrollmentAvailable,
    boolean enrolled,
    Long verifiedAt) {}
