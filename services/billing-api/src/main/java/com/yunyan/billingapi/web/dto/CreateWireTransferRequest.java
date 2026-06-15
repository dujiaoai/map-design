package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWireTransferRequest(
    @NotBlank @Size(max = 128) String companyName,
    @NotBlank @Email @Size(max = 128) String contactEmail,
    @Min(1) long amountCents,
    @Min(1) long points,
    @Size(max = 128) String bankReference) {}
