package com.stockmate.stockmate_backend.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductInfoDTO(
        UUID id,
        String sku,
        String name,
        String description,
        BigDecimal unitPrice,
        String unit,
        String category,
        Integer stock,
        Integer minStock,
        Boolean state
) {
}
