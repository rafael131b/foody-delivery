package com.foodydelivery.tracker.order;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    public OrderDtos.PageResponse list(String email, int page, int size, OrderStatus status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")
                .and(Sort.by(Sort.Direction.DESC, "id")));
        Page<Order> orders = status == null
                ? repo.findAllByOwnerEmail(email, pageable)
                : repo.findAllByOwnerEmailAndStatus(email, status, pageable);

        Map<OrderStatus, Long> statusCounts = new EnumMap<>(OrderStatus.class);
        for (OrderStatus orderStatus : OrderStatus.values()) {
            statusCounts.put(orderStatus, 0L);
        }
        for (Object[] count : repo.countStatusesByOwnerEmail(email)) {
            statusCounts.put((OrderStatus) count[0], (Long) count[1]);
        }

        return new OrderDtos.PageResponse(orders.getContent().stream().map(OrderDtos.Response::of).toList(),
                orders.getNumber(), orders.getSize(), orders.getTotalElements(), orders.getTotalPages(),
                orders.isFirst(), orders.isLast(), statusCounts);
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
