package com.yunyan.saasapi.web.dto.uav;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "机库列表")
public record UavDockListResponse(@Schema(description = "机库条目") List<UavDockDto> items) {}
