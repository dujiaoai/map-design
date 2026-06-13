package com.yunyan.saasapi.application.tenant;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.util.StringUtils;

public final class TenantSlugGenerator {

  private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");
  private static final Set<String> RESERVED =
      Set.of(
          "admin",
          "api",
          "app",
          "auth",
          "demo",
          "login",
          "ping",
          "platform",
          "register",
          "test",
          "v1",
          "www");

  private TenantSlugGenerator() {}

  public static String normalizeSlug(String raw) {
    if (!StringUtils.hasText(raw)) {
      return null;
    }
    var normalized =
        raw.trim()
            .toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-+|-+$", "")
            .replaceAll("-{2,}", "-");
    if (normalized.isEmpty()) {
      return null;
    }
    if (normalized.length() > 64) {
      normalized = normalized.substring(0, 64).replaceAll("-+$", "");
    }
    return normalized.isEmpty() ? null : normalized;
  }

  public static String slugFromOrgName(String orgName) {
    return normalizeSlug(orgName);
  }

  public static void validateSlug(String slug) {
    if (!StringUtils.hasText(slug) || slug.length() < 2) {
      throw AuthException.badRequest("Organization identifier must be at least 2 characters");
    }
    if (!SLUG_PATTERN.matcher(slug).matches()) {
      throw AuthException.badRequest("Organization identifier format is invalid");
    }
    if (RESERVED.contains(slug)) {
      throw AuthException.badRequest("Organization identifier is reserved");
    }
  }

  public static String resolveUniqueSlug(String preferred, TenantRepository tenantRepository) {
    validateSlug(preferred);
    if (tenantRepository.findBySlug(preferred).isEmpty()) {
      return preferred;
    }
    for (var suffix = 2; suffix <= 100; suffix++) {
      var candidate = appendSuffix(preferred, suffix);
      if (tenantRepository.findBySlug(candidate).isEmpty()) {
        return candidate;
      }
    }
    throw AuthException.conflict("Unable to allocate organization identifier");
  }

  private static String appendSuffix(String base, int suffix) {
    var suffixText = "-" + suffix;
    if (base.length() + suffixText.length() <= 64) {
      return base + suffixText;
    }
    var trimmed = base.substring(0, Math.max(2, 64 - suffixText.length())).replaceAll("-+$", "");
    return trimmed + suffixText;
  }
}
