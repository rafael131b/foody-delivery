package com.foodydelivery.tracker.order;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final int MAX_PAGE_SIZE = 100;

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDtos.Response create(@Valid @RequestBody OrderDtos.CreateRequest request, Authentication auth) {
        return service.create(request, auth.getName());
    }

    @GetMapping
    public OrderDtos.PageResponse list(Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) OrderStatus status) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Página deve ser maior ou igual a zero e tamanho deve estar entre 1 e 100");
        }
        return service.list(auth.getName(), page, size, status);
    }

    @GetMapping("/{id}")
    public OrderDtos.Response get(@PathVariable Long id, Authentication auth) {
        return service.get(id, auth.getName());
    }

    @PatchMapping("/{id}/status")
    public OrderDtos.Response status(@PathVariable Long id,
            @Valid @RequestBody OrderDtos.StatusRequest request, Authentication auth) {
        return service.updateStatus(id, request, auth.getName());
    }
}
