package com.yunyan.saasapi.web.dto.scim;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ScimGroupMemberRef(@JsonProperty("value") String value) {}
