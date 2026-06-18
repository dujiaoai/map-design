package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record ScimChangePreviewItemDto(
    @Schema(description = "inbound | outbound") String direction,
    @Schema(description = "事件类型或资源类型") String type,
    @Schema(description = "外部 ID") String externalId,
    @Schema(description = "状态或操作") String statusOrOperation,
    @Schema(description = "创建时间 epoch ms") long createdAtMs) {}
