package com.yunyan.saasapi.application.auth.saml;

import com.yunyan.saasapi.security.AuthException;
import java.io.StringReader;
import javax.xml.parsers.DocumentBuilderFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

@Component
@RequiredArgsConstructor
public class SamlIdpMetadataClient {

  private static final String HTTP_REDIRECT =
      "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect";

  private final RestClient restClient = RestClient.create();
  private final SamlCertificateExpiryParser certificateExpiryParser;

  public SamlIdpMetadataDocument fetchAndParse(String metadataUrl) {
    if (metadataUrl == null || metadataUrl.isBlank()) {
      throw AuthException.badRequest("metadata_url is required");
    }
    var xml =
        restClient
            .get()
            .uri(metadataUrl.trim())
            .retrieve()
            .body(String.class);
    if (xml == null || xml.isBlank()) {
      throw AuthException.badRequest("Empty SAML metadata response");
    }
    return parse(xml);
  }

  public SamlIdpMetadataDocument parse(String xml) {
    try {
      var factory = DocumentBuilderFactory.newInstance();
      factory.setNamespaceAware(true);
      factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
      var doc = factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
      var root = doc.getDocumentElement();
      var entityId = root.getAttribute("entityID");
      if (entityId == null || entityId.isBlank()) {
        throw AuthException.badRequest("SAML metadata missing entityID");
      }
      var ssoUrl = findSsoUrl(root);
      var certificatePem = findSigningCertificate(root);
      var certificateExpiresAt = certificateExpiryParser.parseExpiry(certificatePem);
      return new SamlIdpMetadataDocument(entityId.trim(), ssoUrl, certificatePem, certificateExpiresAt);
    } catch (AuthException ex) {
      throw ex;
    } catch (Exception ex) {
      throw AuthException.badRequest("Failed to parse SAML metadata: " + ex.getMessage());
    }
  }

  private static String findSsoUrl(Element root) {
    var nodes = root.getElementsByTagNameNS("*", "SingleSignOnService");
    for (var i = 0; i < nodes.getLength(); i++) {
      var node = (Element) nodes.item(i);
      var binding = node.getAttribute("Binding");
      if (HTTP_REDIRECT.equals(binding) || binding.isBlank()) {
        var location = node.getAttribute("Location");
        if (!location.isBlank()) {
          return location.trim();
        }
      }
    }
    throw AuthException.badRequest("SAML metadata missing SingleSignOnService Location");
  }

  private static String findSigningCertificate(Element root) {
    var certNodes = root.getElementsByTagNameNS("*", "X509Certificate");
    if (certNodes.getLength() == 0) {
      return null;
    }
    var raw = certNodes.item(0).getTextContent().replaceAll("\\s", "");
    if (raw.isBlank()) {
      return null;
    }
    return "-----BEGIN CERTIFICATE-----\n"
        + chunk(raw, 64)
        + "\n-----END CERTIFICATE-----";
  }

  private static String chunk(String value, int width) {
    var sb = new StringBuilder();
    for (var i = 0; i < value.length(); i += width) {
      if (i > 0) {
        sb.append('\n');
      }
      sb.append(value, i, Math.min(i + width, value.length()));
    }
    return sb.toString();
  }
}
