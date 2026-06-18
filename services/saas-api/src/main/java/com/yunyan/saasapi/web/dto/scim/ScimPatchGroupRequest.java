package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ScimPatchGroupRequest(
    @JsonProperty("displayName") String displayName,
    @JsonProperty("members") List<ScimGroupMemberRef> members,
    @JsonProperty("roleCode") String roleCode) {}
