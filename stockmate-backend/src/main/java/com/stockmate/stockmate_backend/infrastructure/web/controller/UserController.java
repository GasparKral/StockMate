package com.stockmate.stockmate_backend.infrastructure.web.controller;

import com.stockmate.stockmate_backend.application.dto.response.UserInfoDTO;
import com.stockmate.stockmate_backend.domain.model.Role;
import com.stockmate.stockmate_backend.domain.model.UserStatus;
import com.stockmate.stockmate_backend.domain.service.UserService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserInfoDTO>> getUsers() {
        return ResponseEntity.ok(service.getUsers());
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserInfoDTO> updateRole(
            @PathVariable @NotNull UUID id,
            @RequestBody @NotNull RoleUpdateDTO dto) {
        return ResponseEntity.ok(service.updateRole(id, dto.role()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserInfoDTO> updateStatus(
            @PathVariable @NotNull UUID id,
            @RequestBody @NotNull StatusUpdateDTO dto) {
        return ResponseEntity.ok(service.updateStatus(id, dto.status()));
    }

    // RoleUpdateDTO.java
    public record RoleUpdateDTO(@NotNull Role role) {
    }

    // StatusUpdateDTO.java
    public record StatusUpdateDTO(@NotNull UserStatus status) {
    }
}
