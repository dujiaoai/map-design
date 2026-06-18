package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ScimUserResource(
    @JsonProperty("schemas") List<String> schemas,
    @JsonProperty("id") String id,
    @JsonProperty("externalId") String externalId,
    @JsonProperty("userName") String userName,
    @JsonProperty("displayName") String displayName,
    @JsonProperty("active") boolean active,
    @JsonProperty("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User")
        ScimEnterpriseExtension enterprise) {

  public static ScimUserResource of(
      String id, String externalId, String email, String displayName, boolean active) {
    return of(id, externalId, email, displayName, active, null, null);
  }

  public static ScimUserResource of(
      String id,
      String externalId,
      String email,
      String displayName,
      boolean active,
      String department,
      String managerExternalId) {
    List<String> schemaList = new ArrayList<>();
    schemaList.add("urn:ietf:params:scim:schemas:core:2.0:User");
    ScimEnterpriseExtension enterprise = null;
    if (department != null || managerExternalId != null) {
      schemaList.add("urn:ietf:params:scim:schemas:extension:enterprise:2.0:User");
      enterprise =
          new ScimEnterpriseExtension(
              department,
              managerExternalId != null
                  ? new ScimEnterpriseExtension.ScimManagerRef(managerExternalId, null)
                  : null);
    }
    return new ScimUserResource(
        schemaList, id, externalId, email, displayName, active, enterprise);
  }
}
