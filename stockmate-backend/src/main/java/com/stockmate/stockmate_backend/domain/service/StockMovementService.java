package com.stockmate.stockmate_backend.domain.service;

import com.stockmate.stockmate_backend.application.dto.request.StockMovementCreationDTO;
import com.stockmate.stockmate_backend.application.dto.response.StockMovementInfoDTO;
import com.stockmate.stockmate_backend.domain.model.StockMovement;
import com.stockmate.stockmate_backend.domain.resposity.StockMovementRepository;
import com.stockmate.stockmate_backend.infrastructure.persistance.entity.FilterMovementsOptions;
import com.stockmate.stockmate_backend.infrastructure.persistance.mapper.StockMovementCreationMapper;
import com.stockmate.stockmate_backend.infrastructure.persistance.mapper.StockMovementInfoMapper;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class StockMovementService {

    @Autowired
    private StockMovementRepository repository;
    @Autowired
    private StockMovementInfoMapper stockMovementInfoMapper;
    @Autowired
    private StockMovementCreationMapper stockMovementCreationMapper;

    public List<StockMovementInfoDTO> getMovements(@NotNull Integer pageSize, @NotNull Integer page, FilterMovementsOptions filter) {
        var movements = repository.findAll(PageRequest.of(page, pageSize)).getContent().stream();
        if (filter != null) {
            if (filter.product() != null) {
                movements = movements.filter(m -> m.getProduct().getId() == filter.product());
            }
            if (filter.reason() != null) {
                movements = movements.filter(m -> m.getReason() == filter.reason());
            }
            if (filter.type() != null) {
                movements = movements.filter(m -> m.getType() == filter.type());
            }
        }
        movements = movements.sorted(Comparator.comparing(StockMovement::getRegisteredAt));
        return movements.map(stockMovementInfoMapper::stockMovementToStockMovementInfoDTO).toList();
    }

    public List<StockMovementInfoDTO> getMovements(@NotNull UUID id) {
        var movements = repository.queryForProduct(id);
        return movements.stream().map(stockMovementInfoMapper::stockMovementToStockMovementInfoDTO).toList();
    }

    public StockMovementInfoDTO saveTransaction(@NotNull StockMovementCreationDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        String name = authentication.getName();
        var movement = repository.save(stockMovementCreationMapper.stockMovementCreationDTOToStockMovement(dto, name));
        return stockMovementInfoMapper.stockMovementToStockMovementInfoDTO(movement);
    }
}
