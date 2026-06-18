package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

public record ObjectStorageConsistencyCheckResponse(
    @Schema(description = "校验日志 ID") UUID checkLogId,
    @Schema(description = "样本是否一致") boolean sampleMatched,
    @Schema(description = "检查对象数") int objectsChecked,
    @Schema(description = "不一致数") int mismatchedCount) {}
