package com.yunyan.saasapi.application.scim;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
public class ScimBulkIncrementalFilter {

  public boolean accept(Object data, Instant modifiedSince) {
    if (modifiedSince == null || data == null) {
      return true;
    }
    if (!(data instanceof JsonNode node)) {
      return true;
    }
    var meta = node.get("meta");
    if (meta == null || meta.get("lastModified") == null) {
      return true;
    }
    try {
      var lastModified = Instant.parse(meta.get("lastModified").asText());
      return !lastModified.isBefore(modifiedSince);
    } catch (Exception ex) {
      return true;
    }
  }
}
