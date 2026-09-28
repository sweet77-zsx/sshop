package com.sshop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final AuthInterceptor auth;
    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    public WebConfig(AuthInterceptor a) {
        auth = a;
    }

    public void addInterceptors(InterceptorRegistry r) {
        r.addInterceptor(auth).addPathPatterns("/api/goods/**", "/api/order/**", "/api/shop/**", "/api/upload");
    }

    public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/api/**").allowedOriginPatterns("http://localhost:[*]", "http://127.0.0.1:[*]").allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS").allowedHeaders("*").exposedHeaders("*").allowCredentials(true).maxAge(3600);
    }

    public void addResourceHandlers(ResourceHandlerRegistry r) {
        r.addResourceHandler("/uploads/**").addResourceLocations("file:" + uploadDir + "/");
    }
}
