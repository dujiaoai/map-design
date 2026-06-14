package com.yunyan.billingapi.security;

import com.yunyan.billingapi.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  public static final String CLAIM_TENANT_ID = "tenant_id";
  public static final String CLAIM_ROLES = "roles";
  public static final String CLAIM_PERMISSIONS = "permissions";
  public static final String CLAIM_PERM_EPOCH = "perm_epoch";
  public static final String CLAIM_TOKEN_TYPE = "typ";
  public static final String TYPE_ACCESS = "access";

  private final JwtProperties properties;
  private final SecretKey secretKey;

  public JwtService(JwtProperties properties) {
    this.properties = properties;
    this.secretKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
  }

  public ParsedAccessToken parseAccessToken(String token) {
    var claims = parseClaims(token);
    var type = claims.get(CLAIM_TOKEN_TYPE, String.class);
    if (!TYPE_ACCESS.equals(type)) {
      throw AuthException.unauthorized("Invalid access token");
    }
    var parsed = toParsedAccessToken(claims);
    ensurePermEpochValid(parsed.permEpoch());
    return parsed;
  }

  private ParsedAccessToken toParsedAccessToken(Claims claims) {
    return new ParsedAccessToken(
        UUID.fromString(claims.getSubject()),
        UUID.fromString(claims.get(CLAIM_TENANT_ID, String.class)),
        readRoles(claims),
        readPermissions(claims),
        readPermEpoch(claims),
        claims.getId(),
        claims.getExpiration().toInstant());
  }

  public void ensurePermEpochValid(int tokenPermEpoch) {
    var current = properties.effectivePermEpoch();
    if (current <= 0) {
      return;
    }
    if (tokenPermEpoch < current) {
      throw PermEpochStaleException.create();
    }
  }

  private int readPermEpoch(Claims claims) {
    var epoch = claims.get(CLAIM_PERM_EPOCH);
    if (epoch instanceof Number number) {
      return number.intValue();
    }
    if (epoch instanceof String text) {
      try {
        return Integer.parseInt(text);
      } catch (NumberFormatException ignored) {
        return 0;
      }
    }
    return 0;
  }

  @SuppressWarnings("unchecked")
  private List<String> readPermissions(Claims claims) {
    var permissions = claims.get(CLAIM_PERMISSIONS);
    if (permissions instanceof List<?> list) {
      return list.stream().map(Object::toString).sorted().toList();
    }
    return List.of();
  }

  @SuppressWarnings("unchecked")
  private List<String> readRoles(Claims claims) {
    var roles = claims.get(CLAIM_ROLES);
    if (roles instanceof List<?> list) {
      return list.stream().map(Object::toString).toList();
    }
    return List.of();
  }

  private Claims parseClaims(String token) {
    try {
      return Jwts.parser()
          .verifyWith(secretKey)
          .requireIssuer(properties.issuer())
          .build()
          .parseSignedClaims(token)
          .getPayload();
    } catch (JwtException | IllegalArgumentException ex) {
      throw AuthException.unauthorized("Invalid or expired token");
    }
  }

  public record ParsedAccessToken(
      UUID userId,
      UUID tenantId,
      List<String> roleCodes,
      List<String> permissionCodes,
      int permEpoch,
      String jti,
      Instant expiresAt) {}
}
