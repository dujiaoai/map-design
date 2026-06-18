package com.yunyan.saasapi.application.storage;

public interface ObjectStorageClient {

  String upload(String objectKey, byte[] content, String contentType);

  boolean exists(String objectKey);
}
