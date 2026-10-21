package com.foodydelivery.tracker.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.foodydelivery.tracker.user.User;
import com.foodydelivery.tracker.user.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class OrderServiceTest {
  @Test
  void parsesHashPrefixedIdWithLeadingZeros() {
    OrderRepository repo = mock(OrderRepository.class);
    UserRepository users = mock(UserRepository.class);
    when(repo.searchByOwner(eq(7L), isNull(), eq("%#0001%"), eq(1L), any()))
        .thenReturn(org.springframework.data.domain.Page.empty());

    new OrderService(repo, users).list(7L, 0, 10, null, " #0001 ");

    verify(repo).searchByOwner(eq(7L), isNull(), eq("%#0001%"), eq(1L), any());
  }

  @Test
  void createsOrderWithReceivedStatusAndOptionalComplement() {
    OrderRepository repo = mock(OrderRepository.class);
    UserRepository users = mock(UserRepository.class);
    User owner = new User();
    owner.setId(7L);
    owner.setName("Responsável de Teste");
    when(users.getReferenceById(7L)).thenReturn(owner);
    when(repo.save(any()))
        .thenAnswer(
            invocation -> {
              Order order = invocation.getArgument(0);
              order.setId(1L);
              return order;
            });

    OrderDtos.Response response =
        new OrderService(repo, users)
            .create(new OrderDtos.CreateRequest("Ana", "Pizza x1", "Rua A", " Bloco B "), 7L);

    assertEquals(1L, response.id());
    assertEquals(OrderStatus.RECEBIDO, response.status());
    assertEquals("Bloco B", response.complement());
    assertEquals("Responsável de Teste", response.responsibleName());
    verify(repo).save(any());
  }

  @Test
  void allowsOnlyDocumentedStatusTransitions() {
    assertTrue(OrderStatus.RECEBIDO.canTransitionTo(OrderStatus.EM_PREPARO));
    assertTrue(OrderStatus.RECEBIDO.canTransitionTo(OrderStatus.CANCELADO));
    assertTrue(OrderStatus.EM_PREPARO.canTransitionTo(OrderStatus.SAIU_PARA_ENTREGA));
    assertTrue(OrderStatus.EM_PREPARO.canTransitionTo(OrderStatus.CANCELADO));
    assertTrue(OrderStatus.SAIU_PARA_ENTREGA.canTransitionTo(OrderStatus.ENTREGUE));
  }

  @Test
  void rejectsSkippedTransitionWithoutChangingOrder() {
    OrderRepository repo = mock(OrderRepository.class);
    UserRepository users = mock(UserRepository.class);
    Order order = new Order();
    order.setStatus(OrderStatus.RECEBIDO);
    when(repo.findByIdAndOwner_Id(7L, 7L)).thenReturn(Optional.of(order));
    OrderService service = new OrderService(repo, users);

    assertThrows(
        InvalidOrderStatusTransitionException.class,
        () -> service.updateStatus(7L, new OrderDtos.StatusRequest(OrderStatus.ENTREGUE), 7L));
    assertEquals(OrderStatus.RECEBIDO, order.getStatus());
    verify(repo, never()).save(any());
    assertFalse(OrderStatus.ENTREGUE.canTransitionTo(OrderStatus.CANCELADO));
    assertFalse(OrderStatus.CANCELADO.canTransitionTo(OrderStatus.RECEBIDO));
  }
}
