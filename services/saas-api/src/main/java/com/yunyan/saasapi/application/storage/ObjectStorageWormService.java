package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.ObjectLockMode;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class ObjectStorageWormService {

  private final SaasAppProperties saasAppProperties;

  public PutObjectRequest.Builder applyObjectLock(PutObjectRequest.Builder builder) {
    var storage = saasAppProperties.getObjectStorage();
    if (!storage.isWormEnabled()) {
      return builder;
    }
    var mode =
        "COMPLIANCE".equalsIgnoreCase(storage.getObjectLockMode())
            ? ObjectLockMode.COMPLIANCE
            : ObjectLockMode.GOVERNANCE;
    return builder.objectLockMode(mode);
  }

  public boolean isWormConfigured() {
    return saasAppProperties.getObjectStorage().isWormEnabled();
  }
}
