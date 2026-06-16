package com.yunyan.saasapi.web.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record OidcCallbackRequest(@NotBlank String code, @NotBlank String state) {}
