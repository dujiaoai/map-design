package com.yunyan.billingapi.web.dto;

public record NotificationDto(
    String id,
    String category,
    String title,
    String body,
    boolean read,
    String createdAt) {}
