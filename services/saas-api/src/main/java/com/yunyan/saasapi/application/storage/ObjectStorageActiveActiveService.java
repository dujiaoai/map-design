package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ObjectStorageActiveActiveService {

  private static final Logger log = LoggerFactory.getLogger(ObjectStorageActiveActiveService.class);

  private final SaasAppProperties saasAppProperties;
  private final ObjectStorageClientFactory clientFactory;

  public void dualWrite(String key, byte[] bytes) {
    var storage = saasAppProperties.getObjectStorage();
    var client = clientFactory.getClient();
    client.upload(key, bytes, "application/octet-stream");
    if (!storage.isActiveActiveEnabled()
        || !org.springframework.util.StringUtils.hasText(storage.getSecondaryRegion())) {
      return;
    }
    log.info("Active-active dual-write placeholder for key {} to secondary {}", key, storage.getSecondaryRegion());
  }
}
