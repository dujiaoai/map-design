package com.yunyan.saasapi.security.mfa;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class MfaRecoveryCodeSupport {

  private static final int CODE_COUNT = 10;
  private static final int CODE_LENGTH = 8;
  private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static final SecureRandom RANDOM = new SecureRandom();

  public List<String> generateCodes() {
    var codes = new ArrayList<String>(CODE_COUNT);
    for (var i = 0; i < CODE_COUNT; i++) {
      codes.add(formatDisplayCode(randomRawCode()));
    }
    return codes;
  }

  public String normalize(String input) {
    if (input == null) {
      return "";
    }
    return input.replaceAll("[\\s-]", "").toUpperCase();
  }

  public boolean looksLikeRecoveryCode(String input) {
    var normalized = normalize(input);
    return normalized.length() == CODE_LENGTH && normalized.chars().allMatch(MfaRecoveryCodeSupport::isCodeChar);
  }

  public String formatDisplayCode(String rawCode) {
    var normalized = normalize(rawCode);
    if (normalized.length() != CODE_LENGTH) {
      throw new IllegalArgumentException("Recovery code must be 8 characters");
    }
    return normalized.substring(0, 4) + "-" + normalized.substring(4);
  }

  private String randomRawCode() {
    var builder = new StringBuilder(CODE_LENGTH);
    for (var i = 0; i < CODE_LENGTH; i++) {
      builder.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
    }
    return builder.toString();
  }

  private static boolean isCodeChar(int value) {
    return ALPHABET.indexOf(value) >= 0;
  }
}
