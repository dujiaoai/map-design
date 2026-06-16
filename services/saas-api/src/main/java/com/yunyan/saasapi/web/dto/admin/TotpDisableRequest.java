package com.yunyan.saasapi.web.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record TotpDisableRequest(@NotBlank String code) {}
