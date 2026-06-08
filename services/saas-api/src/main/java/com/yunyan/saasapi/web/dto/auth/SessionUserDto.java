package com.yunyan.saasapi.web.dto.auth;

import java.util.List;

public record SessionUserDto(String id, String email, String name, List<String> roles) {}
