package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record ObjectStorageConsistencyStatusResponse(
    @Schema(description = "累计校验次数") long totalChecks,
    @Schema(description = "不一致次数") long mismatchedChecks,
    @Schema(description = "最近不一致 object key") List<String> recentMismatchedKeys) {}
