package com.watchstore.infrastructure.s3;

import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class S3ImageService {

    private final S3Client s3Client;

    @Value("${app.s3.bucket}")
    private String bucket;

    public String uploadProductImage(UUID productId, MultipartFile file) throws IOException {
        String extension = extractExtension(file.getOriginalFilename(), ".jpg");
        String key = "products/" + productId + "/" + UUID.randomUUID() + extension;
        return uploadAsset(key, file);
    }

    public String uploadProductModel(UUID productId, MultipartFile file) throws IOException {
        String extension = extractExtension(file.getOriginalFilename(), ".glb");
        String key = "products/" + productId + "/models/" + UUID.randomUUID() + extension;
        return uploadAsset(key, file);
    }

    private String uploadAsset(String key, MultipartFile file) throws IOException {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));
        return key;
    }

    private String extractExtension(String filename, String defaultExtension) {
        if (filename == null || !filename.contains(".")) {
            return defaultExtension;
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
