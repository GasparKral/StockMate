package com.stockmate.stockmate_backend.application.dto.response;

import com.stockmate.stockmate_backend.domain.model.Role;

import java.util.UUID;

public record UserAccessDTO(UUID userId, String username, Role role, String token) {
}
