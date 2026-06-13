package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "租户邀请链接列表")
public record TenantInviteLinkListResponse(
    @Schema(description = "邀请链接") List<TenantInviteLinkDto> links) {}
