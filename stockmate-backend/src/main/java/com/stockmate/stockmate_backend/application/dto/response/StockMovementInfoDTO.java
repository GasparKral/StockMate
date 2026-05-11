package com.stockmate.stockmate_backend.application.dto.response;

import com.stockmate.stockmate_backend.domain.model.MovementReason;
import com.stockmate.stockmate_backend.domain.model.MovementType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StockMovementInfoDTO {
    private UUID id;
    private ProductInfoDTO product;
    private MovementType type;
    private MovementReason reason;
    private Integer quantity;
    private String notes;
    private Instant registeredAt;
    private UserInfoDTO registeredBy;
}
