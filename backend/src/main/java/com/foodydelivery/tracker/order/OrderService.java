package com.foodydelivery.tracker.order;

import com.foodydelivery.tracker.user.UserRepository;
import java.util.EnumMap;
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
  private final UserRepository users;

  public OrderService(OrderRepository repo, UserRepository users) {
    this.repo = repo;
    this.users = users;
  }

  @Transactional
  public OrderDtos.Response create(OrderDtos.CreateRequest request, Long ownerId) {
    Order order = new Order();
    order.setCustomer(request.customer().trim());
    order.setItems(request.items().trim());
    order.setDeliveryAddress(request.deliveryAddress().trim());
    order.setComplement(
        request.complement() == null || request.complement().isBlank()
            ? null
            : request.complement().trim());
    order.setOwner(users.getReferenceById(ownerId));
    return OrderDtos.Response.of(repo.save(order));
  }

  public OrderDtos.PageResponse list(Long ownerId, int page, int size, OrderStatus status) {
    Pageable pageable =
        PageRequest.of(
            page,
            size,
            Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
    Page<Order> orders =
        status == null
            ? repo.findAllByOwner_Id(ownerId, pageable)
            : repo.findAllByOwner_IdAndStatus(ownerId, status, pageable);

    Map<OrderStatus, Long> statusCounts = new EnumMap<>(OrderStatus.class);
    for (OrderStatus orderStatus : OrderStatus.values()) {
      statusCounts.put(orderStatus, 0L);
    }
    for (Object[] count : repo.countStatusesByOwnerId(ownerId)) {
      statusCounts.put((OrderStatus) count[0], (Long) count[1]);
    }

    return new OrderDtos.PageResponse(
        orders.getContent().stream().map(OrderDtos.Response::of).toList(),
        orders.getNumber(),
        orders.getSize(),
        orders.getTotalElements(),
        orders.getTotalPages(),
        orders.isFirst(),
        orders.isLast(),
        statusCounts);
  }

  public OrderDtos.Response get(Long id, Long ownerId) {
    return OrderDtos.Response.of(findOwnedOrder(id, ownerId));
  }

  @Transactional
  public OrderDtos.Response updateStatus(Long id, OrderDtos.StatusRequest request, Long ownerId) {
    Order order = findOwnedOrder(id, ownerId);
    if (!order.getStatus().canTransitionTo(request.status())) {
      throw new InvalidOrderStatusTransitionException(order.getStatus(), request.status());
    }
    order.setStatus(request.status());
    return OrderDtos.Response.of(order);
  }

  private Order findOwnedOrder(Long id, Long ownerId) {
    return repo.findByIdAndOwner_Id(id, ownerId)
        .orElseThrow(() -> new NoSuchElementException("Pedido não encontrado"));
  }
}
