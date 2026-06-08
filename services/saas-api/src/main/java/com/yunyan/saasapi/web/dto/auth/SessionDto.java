package com.yunyan.saasapi.web.dto.auth;

public record SessionDto(SessionUserDto user, SessionTenantDto tenant, long expiresAt) {}
