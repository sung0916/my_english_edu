package com.englishapp.api_server.config.jwt;

import com.englishapp.api_server.domain.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")  // application.yml에서 관리할 Secret Key
    private String secretKey;

    // 토큰 만료 시간(3시간)
    private final long expireMs = 1000 * 60 * 60 * 3;

    // 로그인 성공 -> 토큰 생성
    public String createToken(String loginId, UserRole role) {
        Claims claims = Jwts.claims();
        claims.put("loginId", loginId);
        claims.put("role", role.name());

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expireMs))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    // 정보 추출
    private Claims extractClaims(String token) {
        return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token).getBody();
    }

    // loginId 추출
    public String getLoginIdFromToken(String token) {
        return extractClaims(token).get("loginId", String.class);
    }

    // 토큰 만료 체크
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // 토큰 유효성 체크
    public boolean validateToken(String token) {

        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}