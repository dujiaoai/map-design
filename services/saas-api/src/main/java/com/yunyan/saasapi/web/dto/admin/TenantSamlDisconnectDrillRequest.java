package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record TenantSamlDisconnectDrillRequest(
    @Schema(description = "可选；指定联邦 IdP Entity ID，空则演练主 IdP") String idpEntityId) {}
