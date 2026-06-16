package com.yunyan.saasapi.web.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TotpDisableRequest(
    @NotBlank @Pattern(regexp = "\\d{6}") String code) {}
