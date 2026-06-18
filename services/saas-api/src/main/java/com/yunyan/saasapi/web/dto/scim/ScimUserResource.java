package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ScimUserResource(
    @JsonProperty("schemas") List<String> schemas,
    @JsonProperty("id") String id,
    @JsonProperty("externalId") String externalId,
    @JsonProperty("userName") String userName,
    @JsonProperty("displayName") String displayName,
    @JsonProperty("active") boolean active) {

  public static ScimUserResource of(String id, String externalId, String email, String displayName, boolean active) {
    return new ScimUserResource(
        List.of("urn:ietf:params:scim:schemas:core:2.0:User"),
        id,
        externalId,
        email,
        displayName,
        active);
  }
}
