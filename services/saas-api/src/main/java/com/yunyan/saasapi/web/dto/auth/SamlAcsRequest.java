package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record SamlAcsRequest(
    @NotBlank @Schema(description = "Base64 SAMLResponse from IdP POST") String samlResponse,
    @Schema(description = "Optional RelayState from IdP") String relayState) {}
