package com.sshop.config;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Component;
import javax.crypto.SecretKey; import java.nio.charset.StandardCharsets; import java.util.Date;
@Component public class JwtService {
  private final SecretKey key; private final long hours;
  public JwtService(@Value("${app.jwt-secret}") String secret,@Value("${app.jwt-expire-hours:24}") long hours){key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));this.hours=hours;}
  public String create(String subject,String type){return Jwts.builder().subject(subject).claim("type",type).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+hours*3600000)).signWith(key).compact();}
  public Claims parse(String token){return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();}
}
