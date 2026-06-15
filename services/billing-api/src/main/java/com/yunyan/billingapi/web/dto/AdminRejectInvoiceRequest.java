package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminRejectInvoiceRequest(@NotBlank @Size(max = 255) String reason) {}
