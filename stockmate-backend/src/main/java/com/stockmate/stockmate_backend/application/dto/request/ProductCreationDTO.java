package com.stockmate.stockmate_backend.application.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductCreationDTO(
        String sku,
        String name,
        String description,
        String category,
        BigDecimal unitPrice,
        String unit,
        Integer minStock,
        UUID createBy
) {
}
