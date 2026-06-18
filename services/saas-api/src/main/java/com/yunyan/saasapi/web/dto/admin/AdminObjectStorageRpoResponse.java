package com.yunyan.saasapi.web.dto.admin;

public record AdminObjectStorageRpoResponse(
    boolean activeActiveEnabled,
    String primaryRegion,
    String secondaryRegion,
    long replicationLagSeconds,
    int rpoTargetSeconds,
    boolean withinRpo,
    long recordedAt) {}
