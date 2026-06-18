package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScimCreateUserRequest(
    @JsonProperty("externalId") String externalId,
    @JsonProperty("userName") String userName,
    @JsonProperty("displayName") String displayName,
    @JsonProperty("active") Boolean active) {}
