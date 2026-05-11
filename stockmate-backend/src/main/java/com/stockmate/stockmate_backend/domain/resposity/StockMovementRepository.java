package com.stockmate.stockmate_backend.domain.resposity;

import com.stockmate.stockmate_backend.domain.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {
    @Query("SELECT m FROM StockMovement m WHERE m.product.id = :productId")
    List<StockMovement> queryForProduct(@Param("productId") UUID id);
}
