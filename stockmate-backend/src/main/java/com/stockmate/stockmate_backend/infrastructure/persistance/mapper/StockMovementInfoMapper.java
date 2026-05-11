package com.stockmate.stockmate_backend.infrastructure.persistance.mapper;

import com.stockmate.stockmate_backend.application.dto.response.StockMovementInfoDTO;
import com.stockmate.stockmate_backend.domain.model.Category;
import com.stockmate.stockmate_backend.domain.model.StockMovement;
import com.stockmate.stockmate_backend.domain.model.User;
import com.stockmate.stockmate_backend.domain.resposity.UserRepository;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class StockMovementInfoMapper {

    @Autowired
    protected UserRepository userRepository;
    @Autowired
    protected UserInfoMapper userInfoMapper;

    @Mapping(target = "registeredBy", ignore = true)
    public abstract StockMovementInfoDTO stockMovementToStockMovementInfoDTO(StockMovement stockMovement);

    @Mapping(target = "category")
    protected String mapCategory(Category value) {
        return value.getName();
    }

    @AfterMapping
    protected void setUser(StockMovement stockMovement, @MappingTarget StockMovementInfoDTO dto) {
        if (stockMovement.getRegisteredBy() != null) {
            User user = userRepository.findById(stockMovement.getRegisteredBy()).orElseThrow(() -> new RuntimeException("User not found: " + stockMovement.getRegisteredBy()));
            dto.setRegisteredBy(userInfoMapper.userToUserInfoDTO(user));
        }
    }

}
