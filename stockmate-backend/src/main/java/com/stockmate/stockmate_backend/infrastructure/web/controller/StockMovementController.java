package com.stockmate.stockmate_backend.infrastructure.web.controller;

import com.stockmate.stockmate_backend.application.dto.request.StockMovementCreationDTO;
import com.stockmate.stockmate_backend.application.dto.response.StockMovementInfoDTO;
import com.stockmate.stockmate_backend.domain.service.StockMovementService;
import com.stockmate.stockmate_backend.infrastructure.persistance.entity.FilterMovementsOptions;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/movements")
public class StockMovementController {

    @Autowired
    private StockMovementService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StockMovementInfoDTO>> getMovements(@RequestParam(required = false, defaultValue = "15") Integer pageSize,
                                                                   @RequestParam(required = false, defaultValue = "0") Integer page,
                                                                   @ModelAttribute FilterMovementsOptions filter) {

        return ResponseEntity.ok(service.getMovements(pageSize, page, filter));
    }

    @PostMapping
    public ResponseEntity<StockMovementInfoDTO> createMovement(@RequestBody @NotNull StockMovementCreationDTO dto) {
        return ResponseEntity.ok(service.saveTransaction(dto));
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<List<StockMovementInfoDTO>> getMovementForProduct(@PathVariable @NotNull UUID id) {
        return ResponseEntity.ok(service.getMovements(id));
    }
}
