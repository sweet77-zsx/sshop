package com.sshop.common;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@RestControllerAdvice
public class GlobalExceptionHandler {
  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
  @ExceptionHandler(BizException.class) public ApiResponse<Void> biz(BizException e){ log.warn("业务请求失败: {}", e.getMessage()); return ApiResponse.error(e.getMessage()); }
  @ExceptionHandler(MethodArgumentNotValidException.class) public ApiResponse<Void> valid(MethodArgumentNotValidException e){ String message = e.getBindingResult().getFieldError() == null ? "请求参数校验失败" : e.getBindingResult().getFieldError().getDefaultMessage(); log.warn("请求参数校验失败: {}", message); return ApiResponse.error(message); }
  @ExceptionHandler(Exception.class) public ApiResponse<Void> other(Exception e){ log.error("未处理的服务异常", e); return ApiResponse.error(e.getMessage()==null?"server error":e.getMessage()); }
}
