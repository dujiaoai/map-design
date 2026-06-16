package com.yunyan.saasapi.web.dto.admin;

public record TotpEnrollResponse(
    String secret, String otpauthUri, String qrCodeDataUrl) {}
