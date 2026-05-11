package com.stockmate.stockmate_backend.infrastructure.persistance.mapper;

import com.stockmate.stockmate_backend.application.dto.response.ProductInfoDTO;
import com.stockmate.stockmate_backend.domain.model.Category;
import com.stockmate.stockmate_backend.domain.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductInfoMapper {
    @Mapping(source = "category", target = "category")
    @Mapping(source = "deleted", target = "state")
    @Mapping(source = "currentStock", target = "stock")
    ProductInfoDTO productToProductInfoDTO(Product product);

    default String mapCategory(Category category) {
        return category != null ? category.getName() : null;
    }
}
