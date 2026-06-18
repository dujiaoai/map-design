package com.yunyan.saasapi.application.scim;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ScimBulkServiceFilterTest {

  @Test
  void parseLastModifiedFilter_extractsInstant() {
    var instant =
        ScimBulkService.parseLastModifiedFilter(
            "meta.lastModified gt \"2026-01-01T00:00:00Z\"");
    assertThat(instant).isNotNull();
    assertThat(instant.toString()).isEqualTo("2026-01-01T00:00:00Z");
  }
}
