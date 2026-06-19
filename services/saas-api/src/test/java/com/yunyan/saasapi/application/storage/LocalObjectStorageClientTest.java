package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.saasapi.application.storage.LocalObjectStorageClient;
import com.yunyan.saasapi.config.SaasAppProperties;
import java.nio.file.Files;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LocalObjectStorageClientTest {

  @Test
  void upload_writesFileAndReturnsFileUrl(@TempDir java.nio.file.Path tempDir) throws Exception {
    var properties = new SaasAppProperties();
    properties.getObjectStorage().setLocalPath(tempDir.toString());
    properties.getObjectStorage().setBucket("tenant-exports");
    var client = new LocalObjectStorageClient(properties);

    var url = client.upload("demo/export.zip", new byte[] {9, 8, 7}, "application/zip");

    assertThat(url).startsWith("file://");
    assertThat(client.exists("demo/export.zip")).isTrue();
    assertThat(Files.readAllBytes(tempDir.resolve("tenant-exports").resolve("demo").resolve("export.zip")))
        .containsExactly(9, 8, 7);
    assertThat(client.contentLength("demo/export.zip")).isEqualTo(3L);
    try (var stream = client.openStream("demo/export.zip")) {
      assertThat(stream.readAllBytes()).containsExactly(9, 8, 7);
    }
  }
}
