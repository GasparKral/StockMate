package com.stockmate.stockmate_backend.application.dto.request;

import com.stockmate.stockmate_backend.domain.model.MovementReason;
import com.stockmate.stockmate_backend.domain.model.MovementType;

import java.util.UUID;

public record StockMovementCreationDTO(
        UUID productId,
        MovementType type,
        MovementReason reason,
        Integer quantity,
        String notes
) {
}
