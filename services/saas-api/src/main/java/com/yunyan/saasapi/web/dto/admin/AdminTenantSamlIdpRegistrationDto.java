package com.yunyan.saasapi.web.dto.admin;

public record AdminTenantSamlIdpRegistrationDto(
    String id, String idpEntityId, String status, long createdAt) {}
