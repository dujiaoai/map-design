package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScimPatchUserRequest(
    @JsonProperty("externalId") String externalId,
    @JsonProperty("displayName") String displayName,
    @JsonProperty("active") Boolean active) {}
