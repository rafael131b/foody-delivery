package com.foodydelivery.tracker.order;

import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    RECEBIDO,
    EM_PREPARO,
    SAIU_PARA_ENTREGA,
    ENTREGUE,
    CANCELADO;

    public boolean canTransitionTo(OrderStatus next) {
        return allowedNextStatuses().contains(next);
    }

    private Set<OrderStatus> allowedNextStatuses() {
        return switch (this) {
            case RECEBIDO -> EnumSet.of(EM_PREPARO, CANCELADO);
            case EM_PREPARO -> EnumSet.of(SAIU_PARA_ENTREGA, CANCELADO);
            case SAIU_PARA_ENTREGA -> EnumSet.of(ENTREGUE);
            case ENTREGUE, CANCELADO -> EnumSet.noneOf(OrderStatus.class);
        };
    }
}
