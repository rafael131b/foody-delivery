package com.foodydelivery.tracker.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.Locale;
import java.util.Set;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  public static final String LOCAL_DEVELOPMENT_SECRET =
      "foody-local-development-secret-change-before-production";
  private static final Set<String> PRODUCTION_PROFILES = Set.of("prod", "production");
  private static final Set<String> KNOWN_PLACEHOLDERS =
      Set.of(
          LOCAL_DEVELOPMENT_SECRET,
          "replace-with-a-long-random-secret-at-least-32-characters",
          "change-this-secret-key-to-at-least-32-characters");

  private final SecretKey key;
  private final long expiration;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-ms}") long expiration,
      @Value("${spring.profiles.active:local}") String activeProfiles) {
    boolean production =
        Arrays.stream(activeProfiles.split(","))
            .map(profile -> profile.trim().toLowerCase(Locale.ROOT))
            .anyMatch(PRODUCTION_PROFILES::contains);
    if (production && isUnsafeProductionSecret(secret)) {
      throw new IllegalStateException(
          "Configure JWT_SECRET with a unique random value of at least 32 bytes for production");
    }
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expiration = expiration;
  }

  static boolean isUnsafeProductionSecret(String secret) {
    return secret == null
        || secret.getBytes(StandardCharsets.UTF_8).length < 32
        || KNOWN_PLACEHOLDERS.contains(secret);
  }

  public String generate(Long userId) {
    return Jwts.builder()
        .subject(userId.toString())
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(key)
        .compact();
  }

  public Long userId(String token) {
    String subject =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    return Long.valueOf(subject);
  }
}
