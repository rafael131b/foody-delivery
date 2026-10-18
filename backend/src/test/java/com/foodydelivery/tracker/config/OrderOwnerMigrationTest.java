package com.foodydelivery.tracker.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class OrderOwnerMigrationTest {
    @TempDir
    Path tempDir;

    @Test
    void migratesExistingOrdersToOwnerIdsAndPreservesTheirData() throws Exception {
        Path database = tempDir.resolve("legacy.db");
        createLegacyDatabase(database, "owner@example.test");

        migrate(database);

        try (Connection connection = connection(database); Statement statement = connection.createStatement()) {
            try (ResultSet result = statement.executeQuery(
                    "SELECT id, customer, owner_id FROM orders WHERE id = 17")) {
                assertTrue(result.next());
                assertEquals(17L, result.getLong("id"));
                assertEquals("Customer to preserve", result.getString("customer"));
                assertEquals(3L, result.getLong("owner_id"));
            }
            assertFalse(hasColumn(connection, "orders", "owner_email"));
            assertTrue(hasColumn(connection, "orders", "owner_id"));
            try (ResultSet result = statement.executeQuery("PRAGMA foreign_key_list(orders)")) {
                assertTrue(result.next());
                assertEquals("users", result.getString("table"));
            }
            try (ResultSet result = statement.executeQuery("PRAGMA foreign_key_check")) {
                assertFalse(result.next());
            }
        }
    }

    @Test
    void refusesToDiscardOrdersWhoseLegacyOwnerCannotBeMatched() throws Exception {
        Path database = tempDir.resolve("orphaned-owner.db");
        createLegacyDatabase(database, "missing@example.test");

        assertThrows(FlywayException.class, () -> migrate(database));

        try (Connection connection = connection(database); Statement statement = connection.createStatement()) {
            assertTrue(hasColumn(connection, "orders", "owner_email"));
            try (ResultSet result = statement.executeQuery("SELECT COUNT(*) FROM orders")) {
                assertTrue(result.next());
                assertEquals(1, result.getInt(1));
            }
        }
    }

    private void createLegacyDatabase(Path path, String orderOwnerEmail) throws Exception {
        try (Connection connection = connection(path); Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, "
                    + "email VARCHAR(255) NOT NULL UNIQUE, name VARCHAR(255) NOT NULL, "
                    + "password_hash VARCHAR(255) NOT NULL)");
            statement.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, "
                    + "created_at TIMESTAMP NOT NULL, customer VARCHAR(255) NOT NULL, "
                    + "delivery_address VARCHAR(255) NOT NULL, items VARCHAR(2000) NOT NULL, "
                    + "owner_email VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL, "
                    + "complement VARCHAR(255))");
            statement.execute("INSERT INTO users (id, email, name, password_hash) VALUES "
                    + "(3, 'owner@example.test', 'Test Owner', 'hashed-password')");
            try (PreparedStatement order = connection.prepareStatement(
                    "INSERT INTO orders (id, created_at, customer, delivery_address, items, "
                            + "owner_email, status, complement) VALUES "
                            + "(17, '2026-01-01T12:00:00Z', 'Customer to preserve', 'Test address', "
                            + "'Test item', ?, 'RECEBIDO', 'Test complement')")) {
                order.setString(1, orderOwnerEmail);
                order.executeUpdate();
            }
        }
    }

    private void migrate(Path path) {
        Flyway.configure()
                .dataSource("jdbc:sqlite:" + path, null, null)
                .baselineOnMigrate(true)
                .baselineVersion("1")
                .load()
                .migrate();
    }

    private Connection connection(Path path) throws Exception {
        return DriverManager.getConnection("jdbc:sqlite:" + path);
    }

    private boolean hasColumn(Connection connection, String table, String expectedName) throws Exception {
        try (Statement statement = connection.createStatement();
                ResultSet result = statement.executeQuery("PRAGMA table_info(" + table + ")")) {
            while (result.next()) {
                if (expectedName.equals(result.getString("name"))) {
                    return true;
                }
            }
            return false;
        }
    }
}
