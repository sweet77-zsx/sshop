package com.sshop.service;

import org.slf4j.*;
import org.springframework.stereotype.Service;

@Service
public class SubscribeMessageService {
    private static final Logger log = LoggerFactory.getLogger(SubscribeMessageService.class);

    public void send(Long userId, String orderNo) {
        try {
            throw new UnsupportedOperationException("微信订阅消息未配置");
        } catch (Exception e) {
            log.warn("订阅消息发送失败，不影响订单: user={}, order={}", userId, orderNo, e);
        }
    }
}
