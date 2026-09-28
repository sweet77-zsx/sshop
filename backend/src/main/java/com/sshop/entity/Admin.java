package com.sshop.entity;
import com.baomidou.mybatisplus.annotation.*; import lombok.Data; import java.time.LocalDateTime;
@Data @TableName("cs_admin") public class Admin { @TableId("admin_id") private Long adminId; private String username; private String password; private String nickname; @TableField("create_time") private LocalDateTime createTime; @TableField("update_time") private LocalDateTime updateTime; @TableField("del_flag") private Integer delFlag; }
