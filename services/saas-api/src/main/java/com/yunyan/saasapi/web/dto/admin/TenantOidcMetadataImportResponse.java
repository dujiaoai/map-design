package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record TenantOidcMetadataImportResponse(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "IdP issuer") String issuer,
    @Schema(description = "authorization_endpoint") String authorizationEndpoint,
    @Schema(description = "token_endpoint") String tokenEndpoint,
    @Schema(description = "userinfo_endpoint") String userinfoEndpoint,
    @Schema(description = "期望注册的回调 URL") String expectedCallbackUrl,
    @Schema(description = "导入时间 epoch millis") long importedAt) {}
