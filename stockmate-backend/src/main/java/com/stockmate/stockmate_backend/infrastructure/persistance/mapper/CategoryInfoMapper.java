package com.stockmate.stockmate_backend.infrastructure.persistance.mapper;

import com.stockmate.stockmate_backend.application.dto.response.CategoryInfoDTO;
import com.stockmate.stockmate_backend.domain.model.Category;
import com.stockmate.stockmate_backend.domain.resposity.ProductRepository;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class CategoryInfoMapper {

    @Autowired
    private ProductRepository productRepository;

    @Mapping(target = "productCount", ignore = true)
    public abstract CategoryInfoDTO categoryToCategoryInfoDTO(Category category);

    @AfterMapping
    protected void fillProductCount(Category category, @MappingTarget CategoryInfoDTO.CategoryInfoDTOBuilder target) {
        target.productCount(productRepository.countByCategoryIdAndDeletedFalse(category.getId()));
    }
}
