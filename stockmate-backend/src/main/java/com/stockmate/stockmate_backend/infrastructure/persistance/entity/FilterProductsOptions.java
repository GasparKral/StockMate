package com.stockmate.stockmate_backend.infrastructure.persistance.entity;

public record FilterProductsOptions(
        String name,
        String category,
        String disabled,
        String stock
) {
}
