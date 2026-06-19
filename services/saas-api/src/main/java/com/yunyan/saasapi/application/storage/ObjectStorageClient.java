package com.yunyan.saasapi.application.storage;

import java.io.InputStream;

public interface ObjectStorageClient {

  String upload(String objectKey, byte[] content, String contentType);

  default String uploadLarge(String objectKey, InputStream content, long size, String contentType) {
    try {
      return upload(objectKey, content.readAllBytes(), contentType);
    } catch (java.io.IOException ex) {
      throw new IllegalStateException("Failed to read upload stream: " + objectKey, ex);
    }
  }

  boolean exists(String objectKey);

  default java.io.InputStream openStream(String objectKey) {
    throw new UnsupportedOperationException("openStream not supported for object key: " + objectKey);
  }
}
