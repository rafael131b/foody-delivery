package com.foodydelivery.tracker.order;

public class InvalidOrderStatusTransitionException extends RuntimeException {
  public InvalidOrderStatusTransitionException(OrderStatus current, OrderStatus requested) {
    super("Transição de status não permitida: " + current + " -> " + requested);
  }
}
