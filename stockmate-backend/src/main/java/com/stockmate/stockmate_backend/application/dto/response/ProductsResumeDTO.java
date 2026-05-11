package com.stockmate.stockmate_backend.application.dto.response;

import java.math.BigDecimal;

public record ProductsResumeDTO(
        Integer totalProducts,
        BigDecimal totalProductsValue, // €
        Integer alertCount

) {
}
