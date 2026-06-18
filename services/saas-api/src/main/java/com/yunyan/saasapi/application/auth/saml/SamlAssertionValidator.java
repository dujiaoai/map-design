package com.yunyan.saasapi.application.auth.saml;

import com.yunyan.saasapi.security.AuthException;
import java.nio.charset.StandardCharsets;
import java.security.cert.CertificateFactory;
import java.util.Base64;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class SamlAssertionValidator {

  private static final Pattern NAME_ID_PATTERN =
      Pattern.compile("<(?:saml2?:)?NameID[^>]*>([^<]+)</(?:saml2?:)?NameID>");

  public ParsedAssertion validate(String samlResponseBase64, String idpCertificatePem) {
    if (!StringUtils.hasText(samlResponseBase64)) {
      throw AuthException.badRequest("SAMLResponse is required");
    }
    String xml;
    try {
      xml = new String(Base64.getDecoder().decode(samlResponseBase64.trim()), StandardCharsets.UTF_8);
    } catch (IllegalArgumentException ex) {
      throw AuthException.badRequest("Invalid SAMLResponse encoding");
    }
    if (!xml.contains("Assertion") || !xml.contains("StatusCode")) {
      throw AuthException.badRequest("Malformed SAML assertion");
    }
    if (StringUtils.hasText(idpCertificatePem)) {
      verifySignatureStub(xml, idpCertificatePem);
    }
    var matcher = NAME_ID_PATTERN.matcher(xml);
    if (!matcher.find()) {
      throw AuthException.badRequest("SAML NameID not found");
    }
    return new ParsedAssertion(matcher.group(1).trim());
  }

  private void verifySignatureStub(String xml, String certificatePem) {
    if (!xml.contains("Signature")) {
      throw AuthException.unauthorized("SAML assertion is not signed");
    }
    try {
      var normalized =
          certificatePem
              .replace("-----BEGIN CERTIFICATE-----", "")
              .replace("-----END CERTIFICATE-----", "")
              .replaceAll("\\s", "");
      var bytes = Base64.getDecoder().decode(normalized);
      CertificateFactory.getInstance("X.509").generateCertificate(new java.io.ByteArrayInputStream(bytes));
    } catch (Exception ex) {
      throw AuthException.unauthorized("Invalid IdP certificate");
    }
  }

  public record ParsedAssertion(String nameId) {}
}
