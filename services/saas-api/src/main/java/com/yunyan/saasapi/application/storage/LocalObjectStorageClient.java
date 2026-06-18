package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class LocalObjectStorageClient implements ObjectStorageClient {

  private final SaasAppProperties saasAppProperties;

  @Override
  public String upload(String objectKey, byte[] content, String contentType) {
    var path = resolvePath(objectKey);
    try {
      Files.createDirectories(path.getParent());
      Files.write(path, content);
      return resolvePublicUrl(objectKey);
    } catch (IOException ex) {
      throw new IllegalStateException("Failed to write export artifact: " + objectKey, ex);
    }
  }

  @Override
  public boolean exists(String objectKey) {
    return Files.exists(resolvePath(objectKey));
  }

  private Path resolvePath(String objectKey) {
    var base = Path.of(saasAppProperties.getObjectStorage().getLocalPath()).toAbsolutePath().normalize();
    var bucket = saasAppProperties.getObjectStorage().getBucket();
    var key = objectKey.startsWith("/") ? objectKey.substring(1) : objectKey;
    return base.resolve(bucket).resolve(key);
  }

  private String resolvePublicUrl(String objectKey) {
    var base = saasAppProperties.getObjectStorage().getPublicBaseUrl();
    if (StringUtils.hasText(base)) {
      var trimmed = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
      return trimmed + "/" + objectKey;
    }
    return "file://" + resolvePath(objectKey);
  }
}
