package com.yunyan.saasapi.web.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTenantSamlIdpFederationRequest(
    @NotBlank String idpEntityId,
    @NotBlank String ssoUrl,
    String certificatePem,
    @NotNull Integer priority,
    Boolean enabled) {}
