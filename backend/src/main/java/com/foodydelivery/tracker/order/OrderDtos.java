package com.foodydelivery.tracker.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class OrderDtos {
    private OrderDtos() {}

    public record CreateRequest(@NotBlank String customer, @NotBlank String items,
            @NotBlank String deliveryAddress, @Size(max = 200) String complement) {}

    public record StatusRequest(@NotNull OrderStatus status) {}

    public record Response(Long id, String customer, String items, String deliveryAddress,
            String complement, OrderStatus status, Instant createdAt) {
        static Response of(Order order) {
            return new Response(order.getId(), order.getCustomer(), order.getItems(),
                    order.getDeliveryAddress(), order.getComplement(), order.getStatus(), order.getCreatedAt());
        }
    }

    public record PageResponse(List<Response> content, int page, int size, long totalElements,
            int totalPages, boolean first, boolean last, Map<OrderStatus, Long> statusCounts) {}
}
