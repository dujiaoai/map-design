package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record ScimChangePreviewResponse(
    @Schema(description = "待处理入站事件数") long inboundPendingCount,
    @Schema(description = "待投递出站变更数") long outboundPendingCount,
    @Schema(description = "合并预览项") List<ScimChangePreviewItemDto> items) {}
