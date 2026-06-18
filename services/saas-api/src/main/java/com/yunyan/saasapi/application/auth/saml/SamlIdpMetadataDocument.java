package com.yunyan.saasapi.application.auth.saml;

import java.time.Instant;

public record SamlIdpMetadataDocument(
    String entityId, String ssoUrl, String certificatePem, Instant certificateExpiresAt) {}
