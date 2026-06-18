package com.yunyan.saasapi.web.dto.admin;

public record AdminUsageAnomalyDto(
    String metric, double currentValue, double sevenDayAverage, double ratio, String day) {}

public record AdminUsageAnomaliesResponse(java.util.List<AdminUsageAnomalyDto> anomalies) {}
