package com.englishapp.api_server.config.jwt;

import com.englishapp.api_server.service.impl.UserDetailsServiceImpl;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {
        // "Authorization" 헤더 찾기
        final String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        // Authorization 또는 Bearer로 시작하지 않으면 차단
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Bearer 접두사를 제거하여 순수 토큰 값 추출
        String token = authorizationHeader.substring(7);

        try {

            // 토큰의 유효성 검증
            if (jwtUtil.validateToken(token)) {

                // 토큰에서 loginId 추출
                String loginId = jwtUtil.getLoginIdFromToken(token);

                // loginId로 UserDetails 객체 조회
                UserDetails userDetails = userDetailsService.loadUserByUsername(loginId);

                // SecurityContextHolder에 등록할 Authorization 객체 생성
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );

                // 요청에 대한 세부 정보를 Authentication 객체에 설정
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // SecurityContextHolder에 인증 정보 설정
                // (이 작업 완료 후, Spring Security에서 이 요청을 인증된 사용자의 요청으로 간주)
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
            // 다음 필터로 요청 전달
            filterChain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            log.error("JWT 토큰 만료");

            // 만료 예외 발생 시 401 응답
            setErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "유효하지 않은 토큰");

        }
    }

    // 에러 응답 설정(헬퍼 메서드)
    private void setErrorResponse(HttpServletResponse response, int status, String message) throws IOException {

        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}
