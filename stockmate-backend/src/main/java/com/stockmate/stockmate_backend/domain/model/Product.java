package com.stockmate.stockmate_backend.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = true, length = 500)
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, length = 30)
    private String unit; // "units"/"kg"/"liters" ...

    @NotNull
    @Min(0)
    @Column(nullable = false)
    private Integer minStock = 0;

    @Column(nullable = false)
    private Boolean deleted = false;

    @CreatedDate
    @Column(nullable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @JoinColumn(nullable = false, name = "user_id")
    private UUID createdBy;

    @Formula("(SELECT COALESCE(SUM(CASE WHEN sm.type = 'ENTRY' THEN sm.quantity ELSE 0 END), 0) - " +
            "        COALESCE(SUM(CASE WHEN sm.type = 'EXIT' THEN sm.quantity ELSE 0 END), 0) " +
            " FROM stock_movements sm WHERE sm.product_id = id)")
    private Integer currentStock;
}
