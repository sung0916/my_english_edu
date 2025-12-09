package com.englishapp.api_server.config.jwt;

import com.englishapp.api_server.domain.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")  // application.yml에서 관리할 Secret Key
    private String secretKey;

    private Key key;

    // 토큰 만료 시간(10시간)
    private final long expireMs = 1000 * 60 * 60 * 10;

    // 서버 시작 시 SecretKey를 안전한 Key 객체로 변환
    @PostConstruct
    public void init() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    // 로그인 성공 -> 토큰 생성
    public String createToken(Long userId, String loginId, UserRole role) {
        Claims claims = Jwts.claims();
        claims.put("userId", userId);
        claims.put("loginId", loginId);
        claims.put("role", role.name());

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expireMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 정보 추출
    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // userId 추출
    public Long getUserIdFromToken(String token) {
        try {
            return extractClaims(token).get("userId", Long.class);
        } catch (Exception e) {
            log.error("토큰에서 userId 추출 실패: {}", e.getMessage());
            return null;
        }
    }

    // loginId 추출
    public String getLoginIdFromToken(String token) {

        try {
            return extractClaims(token).get("loginId", String.class);
        } catch (Exception e) {
            log.error("토큰에서 loginId 추출 실패 : {}", e.getMessage());
            return null;
        }
    }

    // role 추출
    public String getRoleFromToken(String token) {
        try {
            return extractClaims(token).get("role", String.class);
        } catch (Exception e) {
            log.error("토큰에서 role 추출 실패: {}", e.getMessage());
            return null;
        }
    }

    // 토큰 만료 체크
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // 토큰 유효성 체크
    public boolean validateToken(String token) {

        // try-catch 제거
        return !isTokenExpired(token);
    }
}