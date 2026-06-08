package com.yunyan.saasapi.web.dto.auth;

public record AuthTokensDto(String accessToken, String refreshToken, long expiresIn) {}
