package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ScimListResponse(
    @JsonProperty("schemas") List<String> schemas,
    @JsonProperty("totalResults") int totalResults,
    @JsonProperty("startIndex") int startIndex,
    @JsonProperty("itemsPerPage") int itemsPerPage,
    @JsonProperty("Resources") List<Object> resources) {

  public static ScimListResponse empty() {
    return new ScimListResponse(
        List.of("urn:ietf:params:scim:api:messages:2.0:ListResponse"),
        0,
        1,
        0,
        List.of());
  }
}
