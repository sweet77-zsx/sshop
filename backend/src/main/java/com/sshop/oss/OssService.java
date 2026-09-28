package com.sshop.oss;

import com.sshop.common.BizException;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

@Service
public class OssService {
    private static final Logger log = LoggerFactory.getLogger(OssService.class);
    private final OssProperties properties;
    private final S3Client s3Client;
    private final String uploadDir;

    public OssService(OssProperties properties, ObjectProvider<S3Client> s3Client,
                      @Value("${app.upload-dir:./uploads}") String uploadDir) {
        this.properties = properties;
        this.s3Client = s3Client.getIfAvailable();
        this.uploadDir = uploadDir;
    }

    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BizException("文件不能为空");
        String key = buildKey(file.getOriginalFilename());
        try {
            if (properties.isEnabled()) {
                if (s3Client == null) throw new IllegalStateException("S3 客户端未初始化");
                PutObjectRequest request = PutObjectRequest.builder()
                        .bucket(properties.getBucket())
                        .key(key)
                        .contentType(contentType(file))
                        .contentLength(file.getSize())
                        .build();
                s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
                return publicUrl(key);
            }
            Path directory = Paths.get(uploadDir);
            Files.createDirectories(directory);
            Path target = directory.resolve(key);
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target);
            return "/uploads/" + key.replace('\\', '/');
        } catch (IOException | RuntimeException ex) {
            log.error("文件上传失败, mode={}, key={}, originalName={}", properties.isEnabled() ? "s3" : "local", key, file.getOriginalFilename(), ex);
            throw new BizException("文件上传失败: " + ex.getMessage());
        }
    }

    private String buildKey(String originalName) {
        String name = originalName == null ? "file" : Paths.get(originalName).getFileName().toString();
        String extension = "";
        int dot = name.lastIndexOf('.');
        if (dot >= 0) extension = name.substring(dot).toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9.]", "");
        String prefix = properties.getKeyPrefix() == null ? "uploads" : properties.getKeyPrefix().replaceAll("^/+|/+$", "");
        return prefix + "/" + UUID.randomUUID() + extension;
    }

    private String contentType(MultipartFile file) {
        return file.getContentType() == null ? "application/octet-stream" : file.getContentType();
    }

    private String publicUrl(String key) {
        String base = properties.getPublicUrl();
        if (base == null || base.isBlank()) base = properties.getEndpoint() + "/" + properties.getBucket();
        return base.replaceAll("/+$", "") + "/" + key;
    }
}
