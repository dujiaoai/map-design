package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;

@Service
@RequiredArgsConstructor
public class ObjectStorageEncryptionService {

  private final SaasAppProperties saasAppProperties;

  public PutObjectRequest.Builder applyEncryption(PutObjectRequest.Builder builder) {
    var storage = saasAppProperties.getObjectStorage();
    if (!StringUtils.hasText(storage.getServerSideEncryption())) {
      return builder;
    }
    var sse = storage.getServerSideEncryption().trim();
    if ("aws:kms".equalsIgnoreCase(sse) && StringUtils.hasText(storage.getKmsKeyId())) {
      return builder
          .serverSideEncryption(ServerSideEncryption.AWS_KMS)
          .ssekmsKeyId(storage.getKmsKeyId());
    }
    if ("AES256".equalsIgnoreCase(sse)) {
      return builder.serverSideEncryption(ServerSideEncryption.AES256);
    }
    return builder;
  }

  public boolean isEncryptionConfigured() {
    var storage = saasAppProperties.getObjectStorage();
    return StringUtils.hasText(storage.getServerSideEncryption());
  }
}
