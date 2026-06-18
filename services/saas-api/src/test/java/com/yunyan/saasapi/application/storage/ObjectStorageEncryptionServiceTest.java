package com.yunyan.saasapi.application.storage;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.saasapi.config.SaasAppProperties;
import org.junit.jupiter.api.Test;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;

class ObjectStorageEncryptionServiceTest {

  @Test
  void applyEncryption_aes256_setsHeader() {
    var props = new SaasAppProperties();
    props.getObjectStorage().setServerSideEncryption("AES256");
    var service = new ObjectStorageEncryptionService(props);

    var built =
        service
            .applyEncryption(PutObjectRequest.builder().bucket("b").key("k"))
            .build();

    assertThat(built.serverSideEncryption()).isEqualTo(ServerSideEncryption.AES256);
  }

  @Test
  void applyEncryption_kms_setsKeyId() {
    var props = new SaasAppProperties();
    props.getObjectStorage().setServerSideEncryption("aws:kms");
    props.getObjectStorage().setKmsKeyId("arn:aws:kms:us-east-1:123:key/abc");
    var service = new ObjectStorageEncryptionService(props);

    var built =
        service
            .applyEncryption(PutObjectRequest.builder().bucket("b").key("k"))
            .build();

    assertThat(built.serverSideEncryption()).isEqualTo(ServerSideEncryption.AWS_KMS);
    assertThat(built.ssekmsKeyId()).isEqualTo("arn:aws:kms:us-east-1:123:key/abc");
  }
}
