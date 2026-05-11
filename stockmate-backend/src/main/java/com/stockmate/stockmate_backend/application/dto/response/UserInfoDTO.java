package com.stockmate.stockmate_backend.application.dto.response;

import com.stockmate.stockmate_backend.domain.model.Role;
import com.stockmate.stockmate_backend.domain.model.UserStatus;

import java.time.Instant;
import java.util.UUID;

public record UserInfoDTO(
        UUID id,
        String fullName,
        String email,
        Role role,
        UserStatus status,
        Instant createdAt
) {
}
