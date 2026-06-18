package com.yunyan.saasapi.application.auth.saml;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class SamlAuthnRequestBuilder {

  public String buildRedirectUrl(
      String idpSsoUrl, String spEntityId, String acsUrl, String relayState) {
    var requestId = "_" + UUID.randomUUID();
    var xml =
        """
        <?xml version="1.0" encoding="UTF-8"?>
        <samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
          ID="%s" Version="2.0" IssueInstant="%s"
          Destination="%s" AssertionConsumerServiceURL="%s"
          ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
          <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">%s</saml:Issuer>
        </samlp:AuthnRequest>
        """
            .formatted(requestId, java.time.Instant.now(), idpSsoUrl, acsUrl, spEntityId)
            .trim();
    var encoded = Base64.getEncoder().encodeToString(xml.getBytes(StandardCharsets.UTF_8));
    return UriComponentsBuilder.fromUriString(idpSsoUrl)
        .queryParam("SAMLRequest", encoded)
        .queryParam("RelayState", relayState)
        .build(false)
        .toUriString();
  }
}
