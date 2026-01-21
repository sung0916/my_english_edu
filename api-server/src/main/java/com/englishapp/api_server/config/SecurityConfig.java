package com.englishapp.api_server.config;

import com.englishapp.api_server.config.jwt.JwtAuthenticationFilter;
import com.englishapp.api_server.config.jwt.JwtUtil;
import com.englishapp.api_server.service.impl.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // @PreAuthorize 어노테이션을 사용하기 위해 필요
@RequiredArgsConstructor  // JwtUtil, UserDetailsService
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .httpBasic(httpBasic -> httpBasic.disable())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // 1. OPTIONS 요청 허용 (CORS Preflight) - 맨 위 유지
                        .requestMatchers(HttpMethod.OPTIONS, "**").permitAll()

                        // 2. 정적 리소스 (이미지 등)
                        .requestMatchers(HttpMethod.GET, "/api/images/**").permitAll()
                        // .requestMatchers("/api/images/**").hasAuthority("ADMIN") // 필요 시 주석 해제

                        // 3. 공용 API (인증/조회)
                        .requestMatchers("/api/auth/**", "/api/users/signup").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/places/**", "/api/announcements/**", "/api/products/**").permitAll()

                        // A. 관리자, 본인 전용 기능 (일시정지, 재시작) - 가장 구체적이므로 먼저 체크
                        .requestMatchers("/api/licenses/*/pause", "/api/licenses/*/resume").hasAnyAuthority("STUDENT", "TEACHER", "ADMIN")

                        // B. 내 수강권 조회 (GET /api/licenses/my) - 학생, 선생님, 관리자 모두 가능
                        .requestMatchers(HttpMethod.GET, "/api/licenses/my").hasAnyAuthority("STUDENT", "TEACHER", "ADMIN")

                        // C. 수강 시작 (PATCH) - 학생, 선생님, 관리자 모두 가능
                        .requestMatchers(HttpMethod.PATCH, "/api/licenses/start-by-item").hasAnyAuthority("STUDENT", "TEACHER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/licenses/*/start").hasAnyAuthority("STUDENT", "TEACHER", "ADMIN")

                        // 4. 결제/주문 관련 (결제 검증 등)
                        .requestMatchers("/api/carts/**", "/api/orders/**", "/api/payments/**").hasAnyAuthority("STUDENT", "TEACHER", "ADMIN")

                        // 5. 게시글/게임 작성 등
                        .requestMatchers(HttpMethod.POST, "/api/announcements/**").hasAnyAuthority("ADMIN", "TEACHER")
                        .requestMatchers(HttpMethod.PATCH, "/api/announcements/**").hasAnyAuthority("ADMIN", "TEACHER")
                        .requestMatchers(HttpMethod.DELETE, "/api/announcements/**").hasAnyAuthority("ADMIN", "TEACHER")
                        .requestMatchers("/api/games/**").hasAnyAuthority("ADMIN", "TEACHER", "STUDENT")

                        // 6. 관리자 전용 (상품관리, 게시판관리, 어드민페이지)
                        .requestMatchers("/api/announcements/**", "/api/products/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // 7. 기타 인증 필요 요청
                        .requestMatchers("/api/users/me", "/api/auth/confirm-password").authenticated()
                        .anyRequest().authenticated()
                )
                // JwtAuthenticationFilter 추가
                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil, userDetailsService),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // CORS 설정을 위한 Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 출처(Origin) 설정
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:19006", "http://192.168.1.246:5173"));

        // 허용할 HTTP 메서드 설정
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 허용할 헤더 설정
        configuration.setAllowedHeaders(List.of("*"));

        // 자격 증명(credentials) 허용 설정
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로("/**")에 대해 위에서 정의한 CORS 설정을 적용
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
