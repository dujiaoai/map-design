package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScimBulkOperationResult(
    @JsonProperty("method") String method,
    @JsonProperty("bulkId") String bulkId,
    @JsonProperty("status") String status,
    @JsonProperty("location") String location,
    @JsonProperty("response") Object response) {}
