package com.foodydelivery.tracker.order;

import java.util.List;

public enum OrderStatus {
    RECEBIDO,
    EM_PREPARO,
    SAIU_PARA_ENTREGA,
    ENTREGUE,
    CANCELADO;

    public boolean canTransitionTo(OrderStatus next) {
        return allowedNextStatuses().contains(next);
    }

    public List<OrderStatus> allowedNextStatuses() {
        return switch (this) {
            case RECEBIDO -> List.of(EM_PREPARO, CANCELADO);
            case EM_PREPARO -> List.of(SAIU_PARA_ENTREGA, CANCELADO);
            case SAIU_PARA_ENTREGA -> List.of(ENTREGUE);
            case ENTREGUE, CANCELADO -> List.of();
        };
    }
}
