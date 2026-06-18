package com.yunyan.saasapi.web.dto.admin;

public record PatchAuditWebhookTargetRequest(
    String url, String format, Boolean enabled, Integer priority) {}
