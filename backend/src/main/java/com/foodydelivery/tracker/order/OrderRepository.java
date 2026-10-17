package com.foodydelivery.tracker.order;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findAllByOwnerEmail(String email, Pageable pageable);

    Page<Order> findAllByOwnerEmailAndStatus(String email, OrderStatus status, Pageable pageable);

    Optional<Order> findByIdAndOwnerEmail(Long id, String email);

    @Query("select o.status, count(o) from Order o where o.ownerEmail = :email group by o.status")
    List<Object[]> countStatusesByOwnerEmail(@Param("email") String email);
}
