package com.sshop.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("cs_user")
public class User {
    @TableId("user_id")
    private Long userId;
    private String openid;
    @TableField("nick_name")
    private String nickName;
    @TableField("avatar_url")
    private String avatarUrl;
    private String phone;
    @TableField("create_time")
    private LocalDateTime createTime;
    @TableField("update_time")
    private LocalDateTime updateTime;
    @TableField("del_flag")
    private Integer delFlag;
}
