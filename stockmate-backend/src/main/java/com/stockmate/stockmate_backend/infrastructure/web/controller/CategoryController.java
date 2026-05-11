package com.stockmate.stockmate_backend.infrastructure.web.controller;

import com.stockmate.stockmate_backend.application.dto.request.CategoryCreationDTO;
import com.stockmate.stockmate_backend.application.dto.request.UpdateCategoryDTO;
import com.stockmate.stockmate_backend.application.dto.response.CategoryInfoDTO;
import com.stockmate.stockmate_backend.domain.service.CategoryService;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    @Autowired
    private CategoryService service;

    @GetMapping
    public ResponseEntity<List<CategoryInfoDTO>> getCategories() {
        return ResponseEntity.ok(service.getCategories());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryInfoDTO> createCategory(@RequestBody @NotNull CategoryCreationDTO dto) {
        return ResponseEntity.ok(service.createCategory(dto));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryInfoDTO> editCategory(@RequestBody @NotNull UpdateCategoryDTO dto) {
        return ResponseEntity.ok(service.updateCategory(dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable @NotNull Long id) {
        service.deleteCategory(id);
        return ResponseEntity.status(204).build();
    }
}
