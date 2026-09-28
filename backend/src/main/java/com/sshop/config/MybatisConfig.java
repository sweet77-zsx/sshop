package com.sshop.config;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration public class MybatisConfig { @Bean public MybatisPlusInterceptor mybatisPlusInterceptor(){var i=new MybatisPlusInterceptor();i.addInnerInterceptor(new PaginationInnerInterceptor());return i;} }
