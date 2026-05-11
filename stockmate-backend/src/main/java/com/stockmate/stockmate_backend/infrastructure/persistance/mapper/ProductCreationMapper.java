package com.stockmate.stockmate_backend.infrastructure.persistance.mapper;

import com.stockmate.stockmate_backend.application.dto.request.ProductCreationDTO;
import com.stockmate.stockmate_backend.domain.model.Category;
import com.stockmate.stockmate_backend.domain.model.Product;
import com.stockmate.stockmate_backend.domain.resposity.CategoryRepository;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class ProductCreationMapper {

    @Autowired
    protected CategoryRepository categoryRepository;

    @Mapping(target = "category", ignore = true)  // Ignorar el mapeo automático
    public abstract Product productCreationDTOToProduct(ProductCreationDTO dto);

    @AfterMapping
    protected void setCategory(ProductCreationDTO dto, @MappingTarget Product product) {
        if (dto.category() != null && !dto.category().isEmpty()) {
            Category category = categoryRepository.findByName(dto.category())
                    .orElseThrow(() -> new RuntimeException("Category not found: " + dto.category()));
            product.setCategory(category);
        }
    }
}