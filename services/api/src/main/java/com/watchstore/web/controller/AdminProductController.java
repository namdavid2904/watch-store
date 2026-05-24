package com.watchstore.web.controller;

import com.watchstore.infrastructure.s3.S3ImageService;
import com.watchstore.service.ProductService;
import com.watchstore.web.dto.CreateProductRequest;
import com.watchstore.web.dto.ProductResponse;
import com.watchstore.web.dto.UpdateProductRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;
    private final S3ImageService s3ImageService;

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(@PathVariable UUID id,
                                                    @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ProductResponse> uploadImage(@PathVariable UUID id,
                                                         @RequestPart("file") MultipartFile file) throws IOException {
        String imageKey = s3ImageService.uploadProductImage(id, file);
        return ResponseEntity.ok(productService.addImage(id, imageKey));
    }

    @PostMapping("/{id}/model-3d")
    public ResponseEntity<ProductResponse> uploadModel3d(@PathVariable UUID id,
                                                           @RequestPart("file") MultipartFile file) throws IOException {
        String modelKey = s3ImageService.uploadProductModel(id, file);
        return ResponseEntity.ok(productService.setModel3dUrl(id, modelKey));
    }

    @PostMapping("/{id}/gallery-images")
    public ResponseEntity<ProductResponse> uploadGalleryImage(@PathVariable UUID id,
                                                                @RequestPart("file") MultipartFile file) throws IOException {
        String imageKey = s3ImageService.uploadProductImage(id, file);
        return ResponseEntity.ok(productService.addGalleryImage(id, imageKey));
    }
}
