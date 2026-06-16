package com.yunyan.saasapi.web.dto.uav;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "机库摘要")
public record UavDockDto(
    @Schema(description = "机库 ID") String id,
    @Schema(description = "名称", example = "机库-HZ-01") String name,
    @Schema(description = "位置描述", example = "西湖区 · 龙井路") String locationLabel,
    @Schema(description = "无人机数量") int droneCount,
    @Schema(description = "状态", example = "online") String status,
    @Schema(description = "电量百分比；离线时为 null") Integer batteryPercent,
    @Schema(description = "排序权重") int sortOrder) {}
