package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ScimGroupResource(
    @JsonProperty("schemas") List<String> schemas,
    @JsonProperty("id") String id,
    @JsonProperty("externalId") String externalId,
    @JsonProperty("displayName") String displayName,
    @JsonProperty("members") List<ScimGroupMemberRef> members) {

  public static ScimGroupResource of(
      String id, String externalId, String displayName, List<ScimGroupMemberRef> members) {
    return new ScimGroupResource(
        List.of("urn:ietf:params:scim:schemas:core:2.0:Group"),
        id,
        externalId,
        displayName,
        members == null ? List.of() : members);
  }
}
