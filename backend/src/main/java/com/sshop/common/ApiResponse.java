package com.sshop.common;

import lombok.Data;
@Data
public class ApiResponse<T> {
  private int code; private String message; private T data;
  public ApiResponse() {}
  public ApiResponse(int code, String message, T data) { this.code=code; this.message=message; this.data=data; }
  public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(200,"success",data); }
  public static <T> ApiResponse<T> ok() { return ok(null); }
  public static <T> ApiResponse<T> error(String message) { return new ApiResponse<>(500,message,null); }
}
