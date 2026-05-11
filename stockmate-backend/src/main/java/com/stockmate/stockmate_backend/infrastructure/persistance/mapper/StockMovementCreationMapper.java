package com.stockmate.stockmate_backend.infrastructure.persistance.mapper;

import com.stockmate.stockmate_backend.application.dto.request.StockMovementCreationDTO;
import com.stockmate.stockmate_backend.domain.model.StockMovement;
import com.stockmate.stockmate_backend.domain.resposity.ProductRepository;
import com.stockmate.stockmate_backend.domain.resposity.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;

@Mapper(componentModel = "spring")
public abstract class StockMovementCreationMapper {

    @Autowired
    protected ProductRepository productRepository;
    @Autowired
    protected UserRepository userRepository;

    public abstract StockMovement stockMovementCreationDTOToStockMovement(StockMovementCreationDTO dto, String userName);

    @AfterMapping
    protected void setDate(@MappingTarget StockMovement movement) {
        movement.setRegisteredAt(Instant.now());
    }

    @AfterMapping
    protected void setProduct(StockMovementCreationDTO dto, @MappingTarget StockMovement movement) {
        movement.setProduct(productRepository.findById(dto.productId()).orElseThrow(() -> new EntityNotFoundException("Unable to map product with id: " + dto.productId())));
    }

    @AfterMapping
    protected void setRegisterer(String userName, @MappingTarget StockMovement movement) {
        var userInfo = userRepository.findByEmail(userName).orElseThrow();
        movement.setRegisteredBy(userInfo.getId());
    }

}
