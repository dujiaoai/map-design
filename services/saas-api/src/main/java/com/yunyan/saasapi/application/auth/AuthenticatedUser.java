package com.yunyan.saasapi.application.auth;

import java.util.List;
import java.util.UUID;

public record AuthenticatedUser(
    UUID id,
    UUID tenantId,
    String tenantName,
    String tenantSlug,
    String email,
    String displayName,
    String phone,
    String avatarUrl,
    String passwordHash,
    List<String> roleCodes,
    List<String> permissionCodes) {}
