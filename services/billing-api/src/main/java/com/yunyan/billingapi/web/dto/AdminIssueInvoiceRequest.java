package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.Size;

public record AdminIssueInvoiceRequest(@Size(max = 2048) String pdfUrl) {}
