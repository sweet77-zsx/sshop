package com.sshop.service;

import com.sshop.common.BizException;
import com.sshop.config.JwtService;
import com.sshop.entity.User;
import com.sshop.mapper.UserMapper;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.*;
import org.springframework.stereotype.Service;

@Service
public class WxAuth {
    private final JwtService jwt;
    private final UserMapper users;
    @Value("${app.wx.app-id:}")
    public String appId;
    @Value("${app.wx.app-secret:}")
    public String secret;

    public WxAuth(JwtService j, UserMapper u) {
        jwt = j;
        users = u;
    }

    public User user(String token) {
        try {
            Claims c = jwt.parse(token);
            if (!"wx".equals(c.get("type"))) throw new Exception();
            User u = users.selectById(Long.valueOf(c.getSubject()));
            if (u == null) throw new Exception();
            return u;
        } catch (Exception e) {
            throw new BizException("wxToken无效或已过期");
        }
    }

    public void configured() {
        if (appId.isBlank() || secret.isBlank()) throw new BizException("微信小程序配置未配置，无法登录");
    }

    public String token(User u) {
        return jwt.create(u.getUserId().toString(), "wx");
    }
}
