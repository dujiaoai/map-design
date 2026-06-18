package com.yunyan.saasapi.web.dto.admin;

import java.util.List;

public record AdminScimSchemaExtensionResponse(
    String tenantId,
    String attributesJson,
    List<String> enterpriseFields,
    boolean configured) {}
