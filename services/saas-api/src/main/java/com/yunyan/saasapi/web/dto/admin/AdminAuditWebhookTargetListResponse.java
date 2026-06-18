package com.yunyan.saasapi.web.dto.admin;

import java.util.List;

public record AdminAuditWebhookTargetListResponse(
    String primaryWebhookUrl, List<AdminAuditWebhookTargetDto> targets) {}
