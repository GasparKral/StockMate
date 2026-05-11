package com.stockmate.stockmate_backend.infrastructure.web.controller;

import com.stockmate.stockmate_backend.application.dto.request.ProductCreationDTO;
import com.stockmate.stockmate_backend.application.dto.response.ProductInfoDTO;
import com.stockmate.stockmate_backend.application.dto.response.ProductsResumeDTO;
import com.stockmate.stockmate_backend.domain.service.ProductService;
import com.stockmate.stockmate_backend.infrastructure.persistance.entity.FilterProductsOptions;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') || harRole('OPERATOR')")
    public ResponseEntity<List<ProductInfoDTO>> getProducts(
            @RequestParam(defaultValue = "15") Integer pageSize,
            @RequestParam(defaultValue = "0") Integer page,
            @ModelAttribute FilterProductsOptions options
    ) {
        return ResponseEntity.ok(service.getProducts(pageSize, page, options));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<ProductInfoDTO> getProduct(@PathVariable @NotNull UUID id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    @GetMapping("/alerts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductInfoDTO>> getAlerts() {
        return ResponseEntity.ok(service.getLowStockProduct());
    }


    @GetMapping("/resume")
    @PreAuthorize("hashRole('ADMIN')")
    public ResponseEntity<ProductsResumeDTO> getResumeInfo() {
        return ResponseEntity.ok(service.getResume());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductInfoDTO> createProduct(@RequestBody @NotNull ProductCreationDTO dto) {
        return ResponseEntity.ok(service.createProduct(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductInfoDTO> updateProduct(@PathVariable @NotNull UUID id, @RequestBody @NotNull ProductInfoDTO dto) {
        return ResponseEntity.ok(service.updateProduct(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable @NotNull UUID id) throws IllegalAccessException {
        service.deleteProduct(id);
        return ResponseEntity.status(204).build();
    }
}
