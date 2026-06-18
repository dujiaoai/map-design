package com.yunyan.saasapi.web.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record CreateAuditWebhookTargetRequest(
    @NotBlank String url, String format, Boolean enabled, Integer priority) {}
