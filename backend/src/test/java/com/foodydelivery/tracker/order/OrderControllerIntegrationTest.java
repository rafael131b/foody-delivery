package com.foodydelivery.tracker.order;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper objectMapper;

  @Value("${app.jwt.secret}")
  String jwtSecret;

  @Test
  void authenticatedOwnerCanCreateOrderWithComplementAndFollowValidTransitions() throws Exception {
    String token = registerAndGetToken("owner");
    MvcResult created =
        mvc.perform(
                post("/api/orders")
                    .header("Authorization", bearer(token))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                                {"customer":"Ana","items":"1x Pizza","deliveryAddress":"Rua A, 10","complement":"Bloco B"}
                                """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status", is("RECEBIDO")))
            .andExpect(jsonPath("$.allowedNextStatuses[0]", is("EM_PREPARO")))
            .andExpect(jsonPath("$.allowedNextStatuses[1]", is("CANCELADO")))
            .andExpect(jsonPath("$.complement", is("Bloco B")))
            .andExpect(jsonPath("$.responsibleName", is("Test User")))
            .andReturn();
    long id = objectMapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();

    mvc.perform(get("/api/orders/{id}", id).header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.complement", is("Bloco B")));
    mvc.perform(get("/api/orders").header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content[0].id", is((int) id)))
        .andExpect(jsonPath("$.totalElements", is(1)))
        .andExpect(jsonPath("$.totalPages", is(1)))
        .andExpect(jsonPath("$.statusCounts.RECEBIDO", is(1)));

    updateStatus(token, id, "EM_PREPARO").andExpect(status().isOk());
    updateStatus(token, id, "SAIU_PARA_ENTREGA").andExpect(status().isOk());
    updateStatus(token, id, "ENTREGUE").andExpect(status().isOk());
    updateStatus(token, id, "CANCELADO").andExpect(status().isConflict());
  }

  @Test
  void rejectsSkippedTransitionsAndKeepsOriginalStatus() throws Exception {
    String token = registerAndGetToken("skip");
    long id = createOrder(token);

    updateStatus(token, id, "ENTREGUE")
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error").exists());
    mvc.perform(get("/api/orders/{id}", id).header("Authorization", bearer(token)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status", is("RECEBIDO")));
  }

  @Test
  void allowsCancellationFromReceivedAndKeepsCancelledOrderFinal() throws Exception {
    String token = registerAndGetToken("cancel");
    long id = createOrder(token);

    updateStatus(token, id, "CANCELADO").andExpect(status().isOk());
    updateStatus(token, id, "EM_PREPARO").andExpect(status().isConflict());
  }

  @Test
  void paginatesAndFiltersOrdersOnTheServerAndKeepsCountsGlobal() throws Exception {
    String token = registerAndGetToken("pagination");
    long firstOrderId = createOrder(token);
    for (int index = 1; index < 11; index++) {
      createOrder(token);
    }
    updateStatus(token, firstOrderId, "CANCELADO").andExpect(status().isOk());

    mvc.perform(
            get("/api/orders")
                .header("Authorization", bearer(token))
                .param("page", "0")
                .param("size", "10"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content.length()", is(10)))
        .andExpect(jsonPath("$.page", is(0)))
        .andExpect(jsonPath("$.size", is(10)))
        .andExpect(jsonPath("$.totalElements", is(11)))
        .andExpect(jsonPath("$.totalPages", is(2)))
        .andExpect(jsonPath("$.first", is(true)))
        .andExpect(jsonPath("$.last", is(false)))
        .andExpect(jsonPath("$.statusCounts.RECEBIDO", is(10)))
        .andExpect(jsonPath("$.statusCounts.CANCELADO", is(1)));

    mvc.perform(
            get("/api/orders")
                .header("Authorization", bearer(token))
                .param("page", "1")
                .param("size", "10"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content.length()", is(1)))
        .andExpect(jsonPath("$.page", is(1)))
        .andExpect(jsonPath("$.totalElements", is(11)))
        .andExpect(jsonPath("$.last", is(true)));

    mvc.perform(
            get("/api/orders").header("Authorization", bearer(token)).param("status", "CANCELADO"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content.length()", is(1)))
        .andExpect(jsonPath("$.content[0].status", is("CANCELADO")))
        .andExpect(jsonPath("$.totalElements", is(1)))
        .andExpect(jsonPath("$.statusCounts.RECEBIDO", is(10)));
  }

  @Test
  void rejectsInvalidPaginationParameters() throws Exception {
    String token = registerAndGetToken("pagination-invalid");

    mvc.perform(get("/api/orders").header("Authorization", bearer(token)).param("page", "-1"))
        .andExpect(status().isBadRequest());
    mvc.perform(get("/api/orders").header("Authorization", bearer(token)).param("size", "0"))
        .andExpect(status().isBadRequest());
    mvc.perform(get("/api/orders").header("Authorization", bearer(token)).param("size", "101"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void orderRoutesRequireAuthenticationAndHideAnotherUsersOrders() throws Exception {
    mvc.perform(get("/api/orders")).andExpect(status().isUnauthorized());
    mvc.perform(
            post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"customer\":\"Ana\",\"items\":\"Pizza\",\"deliveryAddress\":\"Rua A\"}"))
        .andExpect(status().isUnauthorized());
    mvc.perform(get("/api/orders/1")).andExpect(status().isUnauthorized());
    mvc.perform(
            patch("/api/orders/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"CANCELADO\"}"))
        .andExpect(status().isUnauthorized());
    String ownerToken = registerAndGetToken("private-owner");
    String otherToken = registerAndGetToken("other-user");
    long id = createOrder(ownerToken);

    mvc.perform(get("/api/orders/{id}", id).header("Authorization", bearer(otherToken)))
        .andExpect(status().isNotFound());
    updateStatus(otherToken, id, "CANCELADO").andExpect(status().isNotFound());
    mvc.perform(get("/api/orders").header("Authorization", bearer(otherToken)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalElements", is(0)));
  }

  @Test
  void rejectsMalformedAndExpiredBearerTokensWithUnauthorized() throws Exception {
    mvc.perform(get("/api/orders").header("Authorization", "Bearer not-a-jwt"))
        .andExpect(status().isUnauthorized());

    Instant now = Instant.now();
    String expiredToken =
        Jwts.builder()
            .subject("expired@foody.test")
            .issuedAt(Date.from(now.minusSeconds(120)))
            .expiration(Date.from(now.minusSeconds(60)))
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
            .compact();
    mvc.perform(get("/api/orders").header("Authorization", bearer(expiredToken)))
        .andExpect(status().isUnauthorized());
  }

  private String registerAndGetToken(String prefix) throws Exception {
    String email = prefix + "-" + UUID.randomUUID() + "@foody.test";
    MvcResult result =
        mvc.perform(
                post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"name\":\"Test User\",\"email\":\""
                            + email
                            + "\",\"password\":\"secret123\"}"))
            .andExpect(status().isCreated())
            .andReturn();
    JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
    return response.get("token").asText();
  }

  private long createOrder(String token) throws Exception {
    MvcResult result =
        mvc.perform(
                post("/api/orders")
                    .header("Authorization", bearer(token))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"customer\":\"Ana\",\"items\":\"Pizza\",\"deliveryAddress\":\"Rua A\"}"))
            .andExpect(status().isCreated())
            .andReturn();
    return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
  }

  private org.springframework.test.web.servlet.ResultActions updateStatus(
      String token, long id, String status) throws Exception {
    return mvc.perform(
        patch("/api/orders/{id}/status", id)
            .header("Authorization", bearer(token))
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"status\":\"" + status + "\"}"));
  }

  private String bearer(String token) {
    return "Bearer " + token;
  }
}
