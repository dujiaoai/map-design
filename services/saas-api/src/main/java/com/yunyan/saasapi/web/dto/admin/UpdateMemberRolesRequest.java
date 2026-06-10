package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "更新租户成员角色（全量替换）")
public record UpdateMemberRolesRequest(
    @NotNull @NotEmpty @Schema(description = "角色码列表", example = "[\"MEMBER\"]")
        List<String> roleCodes) {}
