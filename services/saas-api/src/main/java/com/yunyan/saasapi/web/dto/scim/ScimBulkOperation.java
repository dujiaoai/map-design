package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScimBulkOperation(
    @JsonProperty("method") String method,
    @JsonProperty("path") String path,
    @JsonProperty("bulkId") String bulkId,
    @JsonProperty("data") Object data) {}
