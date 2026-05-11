package com.stockmate.stockmate_backend.infrastructure.persistance.entity;

import com.stockmate.stockmate_backend.domain.model.MovementReason;
import com.stockmate.stockmate_backend.domain.model.MovementType;

import java.util.UUID;

public record FilterMovementsOptions(
        MovementType type,
        MovementReason reason,
        UUID product
) {
}
