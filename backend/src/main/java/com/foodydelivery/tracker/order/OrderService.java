package com.foodydelivery.tracker.order;

import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private final OrderRepository repo;

    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public OrderDtos.Response create(OrderDtos.CreateRequest request, String email) {
        Order order = new Order();
        order.setCustomer(request.customer().trim());
        order.setItems(request.items().trim());
        order.setDeliveryAddress(request.deliveryAddress().trim());
        order.setComplement(request.complement() == null || request.complement().isBlank()
                ? null : request.complement().trim());
        order.setOwnerEmail(email);
        return OrderDtos.Response.of(repo.save(order));
    }

    public List<OrderDtos.Response> list(String email) {
        return repo.findAllByOwnerEmailOrderByCreatedAtDesc(email).stream()
                .map(OrderDtos.Response::of).toList();
    }

    public OrderDtos.Response get(Long id, String email) {
        return OrderDtos.Response.of(findOwnedOrder(id, email));
    }

    @Transactional
    public OrderDtos.Response updateStatus(Long id, OrderDtos.StatusRequest request, String email) {
        Order order = findOwnedOrder(id, email);
        if (!order.getStatus().canTransitionTo(request.status())) {
            throw new InvalidOrderStatusTransitionException(order.getStatus(), request.status());
        }
        order.setStatus(request.status());
        return OrderDtos.Response.of(order);
    }

    private Order findOwnedOrder(Long id, String email) {
        return repo.findByIdAndOwnerEmail(id, email)
                .orElseThrow(() -> new NoSuchElementException("Pedido não encontrado"));
    }
}
