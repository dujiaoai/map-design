package com.yunyan.saasapi.web.dto.auth;

public record OidcAuthorizeResponse(String authorizationUrl, String state) {}
