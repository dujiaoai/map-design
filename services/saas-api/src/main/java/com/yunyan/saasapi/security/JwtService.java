package com.yunyan.saasapi.security;

import com.yunyan.saasapi.application.auth.AuthenticatedUser;
import com.yunyan.saasapi.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  public static final String CLAIM_TENANT_ID = "tenant_id";
  public static final String CLAIM_ROLES = "roles";
  public static final String CLAIM_PERMISSIONS = "permissions";
  public static final String CLAIM_TOKEN_TYPE = "typ";
  public static final String TYPE_ACCESS = "access";
  public static final String TYPE_REFRESH = "refresh";

  private final JwtProperties properties;
  private final SecretKey secretKey;

  public JwtService(JwtProperties properties) {
    this.properties = properties;
    this.secretKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
  }

  public IssuedToken issueAccessToken(AuthenticatedUser user) {
    var jti = UUID.randomUUID().toString();
    var expiresAt = Instant.now().plus(properties.accessTtl());
    var token = Jwts.builder()
        .issuer(properties.issuer())
        .subject(user.id().toString())
        .id(jti)
        .claim(CLAIM_TENANT_ID, user.tenantId().toString())
        .claim(CLAIM_ROLES, user.roleCodes())
        .claim(CLAIM_PERMISSIONS, user.permissionCodes())
        .claim(CLAIM_TOKEN_TYPE, TYPE_ACCESS)
        .issuedAt(Date.from(Instant.now()))
        .expiration(Date.from(expiresAt))
        .signWith(secretKey)
        .compact();
    return new IssuedToken(token, expiresAt, jti);
  }

  public IssuedToken issueRefreshToken(AuthenticatedUser user) {
    var jti = UUID.randomUUID().toString();
    var expiresAt = Instant.now().plus(properties.refreshTtl());
    var token = Jwts.builder()
        .issuer(properties.issuer())
        .subject(user.id().toString())
        .id(jti)
        .claim(CLAIM_TENANT_ID, user.tenantId().toString())
        .claim(CLAIM_ROLES, user.roleCodes())
        .claim(CLAIM_PERMISSIONS, user.permissionCodes())
        .claim(CLAIM_TOKEN_TYPE, TYPE_REFRESH)
        .issuedAt(Date.from(Instant.now()))
        .expiration(Date.from(expiresAt))
        .signWith(secretKey)
        .compact();
    return new IssuedToken(token, expiresAt, jti);
  }

  public ParsedAccessToken parseAccessToken(String token) {
    var claims = parseClaims(token);
    var type = claims.get(CLAIM_TOKEN_TYPE, String.class);
    if (!TYPE_ACCESS.equals(type)) {
      throw AuthException.unauthorized("Invalid access token");
    }
    return toParsedAccessToken(claims);
  }

  public ParsedRefreshToken parseRefreshToken(String token) {
    var claims = parseClaims(token);
    var type = claims.get(CLAIM_TOKEN_TYPE, String.class);
    if (!TYPE_REFRESH.equals(type)) {
      throw AuthException.unauthorized("Invalid refresh token");
    }
    var jti = claims.getId();
    if (jti == null || jti.isBlank()) {
      throw AuthException.unauthorized("Invalid refresh token");
    }
    return new ParsedRefreshToken(
        UUID.fromString(claims.getSubject()),
        UUID.fromString(claims.get(CLAIM_TENANT_ID, String.class)),
        readRoles(claims),
        readPermissions(claims),
        jti,
        claims.getExpiration().toInstant());
  }

  private ParsedAccessToken toParsedAccessToken(Claims claims) {
    return new ParsedAccessToken(
        UUID.fromString(claims.getSubject()),
        UUID.fromString(claims.get(CLAIM_TENANT_ID, String.class)),
        readRoles(claims),
        readPermissions(claims),
        claims.getId(),
        claims.getExpiration().toInstant());
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

  public long accessExpiresInSeconds() {
    return properties.accessTtl().getSeconds();
  }

  public record IssuedToken(String token, Instant expiresAt, String jti) {
    public IssuedToken(String token, Instant expiresAt) {
      this(token, expiresAt, null);
    }
  }

  public record ParsedAccessToken(
      UUID userId,
      UUID tenantId,
      List<String> roleCodes,
      List<String> permissionCodes,
      String jti,
      Instant expiresAt) {}

  public record ParsedRefreshToken(
      UUID userId,
      UUID tenantId,
      List<String> roleCodes,
      List<String> permissionCodes,
      String jti,
      Instant expiresAt) {}
}
