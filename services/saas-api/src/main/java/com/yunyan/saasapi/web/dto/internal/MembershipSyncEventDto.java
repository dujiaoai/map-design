package com.yunyan.saasapi.web.dto.internal;

public record MembershipSyncEventDto(
    String id, String eventType, String payload, String createdAt) {}
