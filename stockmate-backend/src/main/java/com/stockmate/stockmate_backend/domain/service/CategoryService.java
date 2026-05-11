package com.stockmate.stockmate_backend.domain.service;

import com.stockmate.stockmate_backend.application.dto.request.CategoryCreationDTO;
import com.stockmate.stockmate_backend.application.dto.request.UpdateCategoryDTO;
import com.stockmate.stockmate_backend.application.dto.response.CategoryInfoDTO;
import com.stockmate.stockmate_backend.domain.resposity.CategoryRepository;
import com.stockmate.stockmate_backend.infrastructure.persistance.mapper.CategoryCreationInfoMapper;
import com.stockmate.stockmate_backend.infrastructure.persistance.mapper.CategoryInfoMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository repository;
    @Autowired
    private CategoryInfoMapper categoryInfoMapper;
    @Autowired
    private CategoryCreationInfoMapper categoryCreationInfoMapper;

    public List<CategoryInfoDTO> getCategories() {
        return repository.findAll().stream().map(categoryInfoMapper::categoryToCategoryInfoDTO).toList();
    }

    public CategoryInfoDTO createCategory(@NotNull CategoryCreationDTO dto) {
        var category = repository.save(categoryCreationInfoMapper.categoryCreationDTOToCategory(dto));
        return categoryInfoMapper.categoryToCategoryInfoDTO(category);
    }

    public void deleteCategory(@NotNull Long id) {
        var category = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Unable to delete category with id: " + id.toString()));
        repository.delete(category);
    }

    public CategoryInfoDTO updateCategory(@NotNull UpdateCategoryDTO dto) {
        var category = repository.findById(dto.id()).orElseThrow(() -> new EntityNotFoundException("Unable to update category with id: " + dto.id()));
        category.setName(dto.name());
        category.setDescription(dto.description());
        return categoryInfoMapper.categoryToCategoryInfoDTO(repository.save(category));
    }
}
