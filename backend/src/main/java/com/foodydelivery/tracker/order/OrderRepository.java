package com.foodydelivery.tracker.order;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
  @EntityGraph(attributePaths = "owner")
  Page<Order> findAllByOwner_Id(Long ownerId, Pageable pageable);

  @EntityGraph(attributePaths = "owner")
  Page<Order> findAllByOwner_IdAndStatus(Long ownerId, OrderStatus status, Pageable pageable);

  @EntityGraph(attributePaths = "owner")
  Optional<Order> findByIdAndOwner_Id(Long id, Long ownerId);

  @EntityGraph(attributePaths = "owner")
  @Query(
      """
      select o from Order o
      where o.owner.id = :ownerId
        and (:status is null or o.status = :status)
        and (lower(o.customer) like :pattern escape '!' or o.id = :orderId)
      """)
  Page<Order> searchByOwner(
      @Param("ownerId") Long ownerId,
      @Param("status") OrderStatus status,
      @Param("pattern") String pattern,
      @Param("orderId") Long orderId,
      Pageable pageable);

  @Query("select o.status, count(o) from Order o where o.owner.id = :ownerId group by o.status")
  List<Object[]> countStatusesByOwnerId(@Param("ownerId") Long ownerId);
}
