package com.yunyan.saasapi.application.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TenantDataExportZipBuilder {

  private final ObjectMapper objectMapper;

  public byte[] buildZip(Map<String, Object> manifest) {
    try (var buffer = new ByteArrayOutputStream();
        var zip = new ZipOutputStream(buffer)) {
      zip.putNextEntry(new ZipEntry("manifest.json"));
      zip.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(manifest));
      zip.closeEntry();
      zip.finish();
      return buffer.toByteArray();
    } catch (IOException ex) {
      throw new IllegalStateException("Failed to build tenant export zip", ex);
    }
  }
}
