package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "更新平台用户角色（仅 PLATFORM_ADMIN；保留租户角色）")
public record UpdateUserRolesRequest(
    @NotNull
        @Schema(
            description = "平台角色码列表（仅 PLATFORM_ADMIN；空列表表示撤销）",
            example = "[\"PLATFORM_ADMIN\"]")
        List<String> roleCodes) {}
