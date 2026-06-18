package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;

class TenantDataExportZipBuilderTest {

  private final TenantDataExportZipBuilder builder = new TenantDataExportZipBuilder(new ObjectMapper());

  @Test
  void buildZip_containsManifestEntry() {
    var zip = builder.buildZip(Map.of("tenantId", "demo", "note", "test"));
    assertThat(zip.length).isGreaterThan(32);
    assertThat(new String(zip)).contains("manifest.json");
  }
}
