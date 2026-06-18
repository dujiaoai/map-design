package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ScimBulkRequest(
    @JsonProperty("schemas") List<String> schemas,
    @JsonProperty("filter") String filter,
    @JsonProperty("Operations") List<ScimBulkOperation> operations) {}
