package com.yunyan.saasapi.web.dto.tenant;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "租户 Plan 配额与当前用量")
public record TenantQuotasResponse(
    @Schema(description = "租户 UUID") String tenantId,
    @Schema(description = "订阅计划", example = "free") String plan,
    @Schema(description = "成员席位") SeatQuotaDto seats,
    @Schema(description = "API 速率（每分钟请求数上限；用量由网关层后续统计）") RateQuotaDto apiRate,
    @Schema(description = "存储配额（业务附件等待 Sprint E 统计 usedBytes）") StorageQuotaDto storage) {

  @Schema(description = "席位配额")
  public record SeatQuotaDto(
      @Schema(description = "上限；null 表示不限") Integer limit,
      @Schema(description = "已占用（active + invited）") long used) {}

  @Schema(description = "API 速率配额")
  public record RateQuotaDto(
      @Schema(description = "每分钟上限") int limitPerMinute) {}

  @Schema(description = "存储配额")
  public record StorageQuotaDto(
      @Schema(description = "上限（字节）") long limitBytes,
      @Schema(description = "已用（字节）；MVP 恒为 0") long usedBytes) {}
}
