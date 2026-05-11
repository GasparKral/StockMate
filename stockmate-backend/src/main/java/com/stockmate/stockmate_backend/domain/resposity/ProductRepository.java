package com.stockmate.stockmate_backend.domain.resposity;

import com.stockmate.stockmate_backend.domain.model.Category;
import com.stockmate.stockmate_backend.domain.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> queryByCategory(Category category);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND " +
            "(SELECT COALESCE(SUM(sm.quantity), 0) FROM StockMovement sm WHERE sm.product = p AND sm.type = 'ENTRY') - " +
            "(SELECT COALESCE(SUM(sm.quantity), 0) FROM StockMovement sm WHERE sm.product = p AND sm.type = 'EXIT') < p.minStock")
    List<Product> queryLowStockProducts();

    int countByCategoryIdAndDeletedFalse(Long categoryId);
}
