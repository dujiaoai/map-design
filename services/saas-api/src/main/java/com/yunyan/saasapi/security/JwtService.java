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
  public static final String CLAIM_ACT_AS_TENANT = "act_as_tenant";
  public static final String CLAIM_ROLES = "roles";
  public static final String CLAIM_PERMISSIONS = "permissions";
  public static final String CLAIM_PERM_EPOCH = "perm_epoch";
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
    return issueAccessToken(user, null);
  }

  public IssuedToken issueAccessToken(AuthenticatedUser user, UUID actAsTenantId) {
    var jti = UUID.randomUUID().toString();
    var expiresAt = Instant.now().plus(properties.accessTtl());
    var builder = Jwts.builder()
        .issuer(properties.issuer())
        .subject(user.id().toString())
        .id(jti)
        .claim(CLAIM_TENANT_ID, user.tenantId().toString())
        .claim(CLAIM_ROLES, user.roleCodes())
        .claim(CLAIM_PERMISSIONS, user.permissionCodes())
        .claim(CLAIM_PERM_EPOCH, properties.effectivePermEpoch())
        .claim(CLAIM_TOKEN_TYPE, TYPE_ACCESS)
        .issuedAt(Date.from(Instant.now()))
        .expiration(Date.from(expiresAt));
    if (actAsTenantId != null) {
      builder.claim(CLAIM_ACT_AS_TENANT, actAsTenantId.toString());
    }
    var token = builder.signWith(secretKey).compact();
    return new IssuedToken(token, expiresAt, jti);
  }

  public IssuedToken issueRefreshToken(AuthenticatedUser user) {
    return issueRefreshToken(user, null);
  }

  public IssuedToken issueRefreshToken(AuthenticatedUser user, UUID actAsTenantId) {
    var jti = UUID.randomUUID().toString();
    var expiresAt = Instant.now().plus(properties.refreshTtl());
    var builder = Jwts.builder()
        .issuer(properties.issuer())
        .subject(user.id().toString())
        .id(jti)
        .claim(CLAIM_TENANT_ID, user.tenantId().toString())
        .claim(CLAIM_ROLES, user.roleCodes())
        .claim(CLAIM_PERMISSIONS, user.permissionCodes())
        .claim(CLAIM_PERM_EPOCH, properties.effectivePermEpoch())
        .claim(CLAIM_TOKEN_TYPE, TYPE_REFRESH)
        .issuedAt(Date.from(Instant.now()))
        .expiration(Date.from(expiresAt));
    if (actAsTenantId != null) {
      builder.claim(CLAIM_ACT_AS_TENANT, actAsTenantId.toString());
    }
    var token = builder.signWith(secretKey).compact();
    return new IssuedToken(token, expiresAt, jti);
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
        readActAsTenantId(claims),
        readRoles(claims),
        readPermissions(claims),
        readPermEpoch(claims),
        jti,
        claims.getExpiration().toInstant());
  }

  private ParsedAccessToken toParsedAccessToken(Claims claims) {
    return new ParsedAccessToken(
        UUID.fromString(claims.getSubject()),
        UUID.fromString(claims.get(CLAIM_TENANT_ID, String.class)),
        readActAsTenantId(claims),
        readRoles(claims),
        readPermissions(claims),
        readPermEpoch(claims),
        claims.getId(),
        claims.getExpiration().toInstant());
  }

  private static UUID readActAsTenantId(Claims claims) {
    var value = claims.get(JwtService.CLAIM_ACT_AS_TENANT, String.class);
    if (value == null || value.isBlank()) {
      return null;
    }
    return UUID.fromString(value);
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
      UUID actAsTenantId,
      List<String> roleCodes,
      List<String> permissionCodes,
      int permEpoch,
      String jti,
      Instant expiresAt) {}

  public record ParsedRefreshToken(
      UUID userId,
      UUID tenantId,
      UUID actAsTenantId,
      List<String> roleCodes,
      List<String> permissionCodes,
      int permEpoch,
      String jti,
      Instant expiresAt) {}
}
