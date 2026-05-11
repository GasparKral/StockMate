package com.stockmate.stockmate_backend.domain.service;

import com.stockmate.stockmate_backend.application.dto.request.ProductCreationDTO;
import com.stockmate.stockmate_backend.application.dto.response.ProductInfoDTO;
import com.stockmate.stockmate_backend.application.dto.response.ProductsResumeDTO;
import com.stockmate.stockmate_backend.domain.model.Product;
import com.stockmate.stockmate_backend.domain.resposity.CategoryRepository;
import com.stockmate.stockmate_backend.domain.resposity.ProductRepository;
import com.stockmate.stockmate_backend.infrastructure.persistance.entity.FilterProductsOptions;
import com.stockmate.stockmate_backend.infrastructure.persistance.mapper.ProductCreationMapper;
import com.stockmate.stockmate_backend.infrastructure.persistance.mapper.ProductInfoMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductInfoMapper productInfoMapper;
    @Autowired
    private ProductCreationMapper productCreationMapper;

    public ProductInfoDTO getProductById(@NotNull UUID id) {
        var product = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Unable to found product with id: " + id.toString()));
        return productInfoMapper.productToProductInfoDTO(product);
    }

    public List<ProductInfoDTO> getProducts(@NotNull Integer pageSize, @NotNull Integer page, @Null FilterProductsOptions options) {
        var products = repository.findAll(PageRequest.of(page, pageSize)).toList();

        if (options != null) {
            if (options.name() != null && !options.name().isEmpty()) {
                products = products.stream().filter(p -> {
                    return p.getName().toLowerCase(Locale.ROOT).contains(options.name().toLowerCase(Locale.ROOT)) ||
                            p.getSku().toLowerCase(Locale.ROOT).contains(options.name().toLowerCase(Locale.ROOT));
                }).toList();
            }

            if (options.category() != null && !options.category().isEmpty()) {
                products = products.stream().filter(p -> {
                    return p.getCategory().getName().toLowerCase(Locale.ROOT).equals(options.category().toLowerCase(Locale.ROOT));
                }).toList();
            }

            if (options.disabled() != null && !options.disabled().isEmpty() && !options.disabled().equals("null")) {
                products = products.stream().filter(p -> {
                    return p.getDeleted() == Boolean.parseBoolean(options.disabled());
                }).toList();
            }

            if (options.stock() != null && !options.stock().isEmpty()) {
                products = products.stream().filter(p -> {
                    if (options.stock().equals("low")) {
                        return p.getCurrentStock() > 0 && p.getCurrentStock() <= p.getMinStock();
                    } else if (options.stock().equals("out")) {
                        return p.getCurrentStock() == 0;
                    } else {
                        return true;
                    }
                }).toList();
            }
        }

        return products.stream().map(productInfoMapper::productToProductInfoDTO).toList();
    }

    public List<ProductInfoDTO> getLowStockProduct() {
        return repository.queryLowStockProducts().stream().map(productInfoMapper::productToProductInfoDTO).toList();
    }

    public ProductInfoDTO createProduct(@NotNull ProductCreationDTO dto) {
        var product = repository.save(productCreationMapper.productCreationDTOToProduct(dto));
        return productInfoMapper.productToProductInfoDTO(product);
    }

    public ProductInfoDTO updateProduct(@NotNull UUID id, @NotNull ProductInfoDTO dto) {
        var product = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Unable to update product with id: " + dto.id()));
        product.setName(dto.name());
        Logger logger = LoggerFactory.getLogger(ProductService.class);
        logger.error(dto.category());
        var category = categoryRepository.findByName(dto.category()).orElseThrow(() -> new IllegalArgumentException("Invalid category type"));
        product.setCategory(category);
        product.setDescription(dto.description());
        product.setUnitPrice(dto.unitPrice());
        product.setUnit(dto.unit());
        return productInfoMapper.productToProductInfoDTO(repository.save(product));
    }

    public void deleteProduct(@NotNull UUID id) throws IllegalAccessException {
        var product = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("Unable to delete product with id: " + id.toString()));
        if (product.getDeleted() == true) {
            throw new IllegalAccessException("Product is already deleted");
        }
        product.setDeleted(true);
        repository.save(product);
    }

    public ProductsResumeDTO getResume() {
        var products = repository.findAll();
        var activeProducts = products.stream().filter(p -> !p.getDeleted()).toList();
        var totalPrice = activeProducts.stream().map(Product::getUnitPrice).reduce(BigDecimal::add).orElse(BigDecimal.valueOf(0));
        return new ProductsResumeDTO(activeProducts.size(), totalPrice, this.getLowStockProduct().size());
    }
}
