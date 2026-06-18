package com.yunyan.saasapi.web.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record SamlIdpRegisterRequest(
    @NotBlank String registrationToken, @NotBlank String idpEntityId) {}
