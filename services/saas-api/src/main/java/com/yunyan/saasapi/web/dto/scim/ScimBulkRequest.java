package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ScimBulkOperation(
    @JsonProperty("method") String method,
    @JsonProperty("path") String path,
    @JsonProperty("bulkId") String bulkId,
    @JsonProperty("data") Object data) {}

public record ScimBulkRequest(
    @JsonProperty("schemas") List<String> schemas,
    @JsonProperty("Operations") List<ScimBulkOperation> operations) {}

public record ScimBulkResponse(
    @JsonProperty("schemas") List<String> schemas,
    @JsonProperty("Operations") List<ScimBulkOperationResult> operations) {}

public record ScimBulkOperationResult(
    @JsonProperty("method") String method,
    @JsonProperty("bulkId") String bulkId,
    @JsonProperty("status") String status,
    @JsonProperty("location") String location,
    @JsonProperty("response") Object response) {}
