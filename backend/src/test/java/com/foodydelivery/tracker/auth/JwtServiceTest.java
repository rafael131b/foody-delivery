package com.foodydelivery.tracker.auth;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class JwtServiceTest {
    @Test
    void storesStableUserIdAsTheJwtSubject() {
        JwtService jwt = new JwtService("test-secret-key-with-at-least-32-characters", 86_400_000, "test");

        assertEquals(42L, jwt.userId(jwt.generate(42L)));
    }

    @Test
    void allowsTheDocumentedDevelopmentSecretInLocalProfile() {
        assertDoesNotThrow(() -> new JwtService(
                JwtService.LOCAL_DEVELOPMENT_SECRET, 86_400_000, "local"));
    }

    @Test
    void refusesTheDevelopmentSecretInProductionProfile() {
        assertThrows(IllegalStateException.class, () -> new JwtService(
                JwtService.LOCAL_DEVELOPMENT_SECRET, 86_400_000, "prod"));
    }

    @Test
    void refusesShortAndExampleSecretsInProductionProfile() {
        assertThrows(IllegalStateException.class,
                () -> new JwtService("short-secret", 86_400_000, "production"));
        assertThrows(IllegalStateException.class, () -> new JwtService(
                "replace-with-a-long-random-secret-at-least-32-characters", 86_400_000, "prod"));
    }

    @Test
    void acceptsAConfiguredProductionSecret() {
        assertDoesNotThrow(() -> new JwtService(
                "independent-production-secret-of-at-least-32-bytes", 86_400_000, "prod"));
    }
}
