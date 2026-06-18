package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
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
  public String uploadLarge(String objectKey, InputStream content, long size, String contentType) {
    var path = resolvePath(objectKey);
    try {
      Files.createDirectories(path.getParent());
      Files.copy(content, path, StandardCopyOption.REPLACE_EXISTING);
      return resolvePublicUrl(objectKey);
    } catch (IOException ex) {
      throw new IllegalStateException("Failed to stream export artifact: " + objectKey, ex);
    }
  }

  @Override
  public boolean exists(String objectKey) {
    return Files.exists(resolvePath(objectKey));
  }

  private Path resolvePath(String objectKey) {
    var storage = saasAppProperties.getObjectStorage();
    var base = Path.of(storage.getLocalPath()).toAbsolutePath().normalize();
    var bucket = storage.getBucket();
    var key = objectKey.startsWith("/") ? objectKey.substring(1) : objectKey;
    if (key.startsWith(bucket + "/")) {
      key = key.substring(bucket.length() + 1);
    }
    return base.resolve(bucket).resolve(key).normalize();
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
