package com.foodydelivery.tracker.order;
import static org.junit.jupiter.api.Assertions.*; import static org.mockito.Mockito.*; import org.junit.jupiter.api.Test; import org.mockito.ArgumentCaptor;
class OrderServiceTest {
    @Test
    void createsOrderWithReceivedStatusAndOptionalComplement() {
        OrderRepository repo = mock(OrderRepository.class);
        when(repo.save(any())).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(1L);
            return order;
        });

        OrderDtos.Response response = new OrderService(repo).create(
                new OrderDtos.CreateRequest("Ana", "Pizza x1", "Rua A", " Bloco B "), "a@b.com");

        assertEquals(1L, response.id());
        assertEquals(OrderStatus.RECEBIDO, response.status());
        assertEquals("Bloco B", response.complement());
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
        Order order = new Order();
        order.setStatus(OrderStatus.RECEBIDO);
        when(repo.findByIdAndOwnerEmail(7L, "a@b.com")).thenReturn(java.util.Optional.of(order));
        OrderService service = new OrderService(repo);

        assertThrows(InvalidOrderStatusTransitionException.class,
                () -> service.updateStatus(7L, new OrderDtos.StatusRequest(OrderStatus.ENTREGUE), "a@b.com"));
        assertEquals(OrderStatus.RECEBIDO, order.getStatus());
        verify(repo, never()).save(any());
        assertFalse(OrderStatus.ENTREGUE.canTransitionTo(OrderStatus.CANCELADO));
        assertFalse(OrderStatus.CANCELADO.canTransitionTo(OrderStatus.RECEBIDO));
    }
}
