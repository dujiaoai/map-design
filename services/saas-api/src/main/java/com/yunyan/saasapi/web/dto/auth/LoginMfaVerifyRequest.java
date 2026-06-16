package com.yunyan.saasapi.web.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginMfaVerifyRequest(
    @NotBlank String mfaChallengeToken,
    @NotBlank @Pattern(regexp = "\\d{6}") String code) {}
