package com.stockmate.stockmate_backend.application.dto.response;

import lombok.Builder;

@Builder
public record CategoryInfoDTO(
        Long id,
        String name,
        String description,
        Integer productCount
) {
}
