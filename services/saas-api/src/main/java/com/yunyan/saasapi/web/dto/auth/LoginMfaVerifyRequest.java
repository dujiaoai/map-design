package com.yunyan.saasapi.web.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginMfaVerifyRequest(
    @NotBlank String mfaChallengeToken, @NotBlank String code) {}
