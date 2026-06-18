package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ScimBulkResponse(
    @JsonProperty("schemas") List<String> schemas,
    @JsonProperty("Operations") List<ScimBulkOperationResult> operations) {}
