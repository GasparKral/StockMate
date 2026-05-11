package com.stockmate.stockmate_backend.infrastructure.persistance.mapper;

import com.stockmate.stockmate_backend.application.dto.request.CategoryCreationDTO;
import com.stockmate.stockmate_backend.domain.model.Category;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.time.Instant;

@Mapper(componentModel = "spring")
public interface CategoryCreationInfoMapper {
    Category categoryCreationDTOToCategory(CategoryCreationDTO dto);

    @AfterMapping
    default void setDate(@MappingTarget Category category) {
        category.setCreatedAt(Instant.now());
    }
}
