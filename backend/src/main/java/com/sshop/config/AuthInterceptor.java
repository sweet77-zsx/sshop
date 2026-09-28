package com.sshop.config;
import com.sshop.common.BizException; import jakarta.servlet.http.*; import org.springframework.stereotype.Component; import org.springframework.web.servlet.HandlerInterceptor;
@Component public class AuthInterceptor implements HandlerInterceptor {
  private final JwtService jwt; public AuthInterceptor(JwtService jwt){this.jwt=jwt;}
  public boolean preHandle(HttpServletRequest r,HttpServletResponse s,Object h){if("OPTIONS".equalsIgnoreCase(r.getMethod()))return true;String v=r.getHeader("Authorization"); if(v==null||!v.startsWith("Bearer ")) throw new BizException("管理员未登录"); try{var c=jwt.parse(v.substring(7));if(!"admin".equals(c.get("type")))throw new Exception();r.setAttribute("adminId",Long.valueOf(c.getSubject()));return true;}catch(Exception e){throw new BizException("管理员登录已失效");}}
}
