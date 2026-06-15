package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateInvoiceRequest(
    @NotBlank @Size(max = 64) String orderNo,
    @NotBlank @Pattern(regexp = "personal|enterprise") String invoiceType,
    @NotBlank @Size(max = 128) String title,
    @Size(max = 32) String taxNo,
    @NotBlank @Email @Size(max = 128) String email) {}
