package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminObjectStoragePolicyResponse(
    @Schema(description = "存储 provider") String provider,
    @Schema(description = "生命周期过期天数") int lifecycleExpireDays,
    @Schema(description = "合规保留天数") int complianceRetainDays,
    @Schema(description = "是否启用跨区复制") boolean replicationEnabled,
    @Schema(description = "复制目标区域") String replicationRegion,
    @Schema(description = "生命周期审计记录数") long lifecycleAuditCount,
    @Schema(description = "是否配置 SSE/KMS") boolean encryptionConfigured,
    @Schema(description = "是否配置 WORM Object Lock") boolean wormConfigured,
    @Schema(description = "最近一次 DR 演练时间（epoch ms）") Long lastDrDrillAt,
    @Schema(description = "一致性校验累计次数") long consistencyCheckCount,
    @Schema(description = "不一致累计次数") long consistencyMismatchCount) {}
