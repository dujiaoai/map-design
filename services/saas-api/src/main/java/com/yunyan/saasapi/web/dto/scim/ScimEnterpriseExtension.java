package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScimEnterpriseExtension(
    @JsonProperty("department") String department,
    @JsonProperty("manager") ScimManagerRef manager) {

  public record ScimManagerRef(@JsonProperty("value") String value, @JsonProperty("displayName") String displayName) {}
}
