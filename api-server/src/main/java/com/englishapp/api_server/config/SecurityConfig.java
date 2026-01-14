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
                        // 1. OPTIONS 요청 허용 (CORS Preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "**").permitAll()

                        // 2. 정적 리소스 (이미지) 조회는 누구나, 수정/삭제는 ADMIN만
                        .requestMatchers(HttpMethod.GET, "/api/images/**").permitAll()
                        .requestMatchers("/api/images/**").hasAuthority("ADMIN")

                        // 3. 인증/회원가입은 누구나
                        .requestMatchers("/api/auth/login", "/api/users/signup").permitAll()

                        // 4. 장소/게시판/상품 조회는 누구나
                        .requestMatchers(HttpMethod.GET, "/api/places/getPlaces", "/api/announcements/**", "/api/products/**").permitAll()

                        // 5. 장바구니, 주문, 결제 기능 (결제 검증 포함)
                        .requestMatchers("/api/carts/**", "/api/orders/**", "/api/payments/**").hasAnyAuthority("TEACHER", "STUDENT", "ADMIN")

                        // 6-1. 관리자 전용 기능 (일시정지, 재시작) - 구체적인 URL을 먼저 체크
                        .requestMatchers("/api/licenses/*/pause", "/api/licenses/*/resume").hasAuthority("ADMIN")
                        // 6-2. 학생/선생님 기능 (내 수강권 조회, 시작하기)
                        .requestMatchers("/api/licenses/my", "/api/licenses/*/start").hasAnyAuthority("TEACHER", "STUDENT", "ADMIN")

                        // 7. 게시글 작성: ADMIN, TEACHER 가능
                        .requestMatchers(HttpMethod.POST, "/api/announcement/write").hasAnyAuthority("ADMIN", "TEACHER")

                        // 8. 게임 관련 API: ADMIN, TEACHER만 접근 가능 (STUDENT는 추후 추가)
                        .requestMatchers("/api/games/**").hasAnyAuthority("ADMIN", "TEACHER", "STUDENT")

                        // 9. 게시판/상품 나머지 기능(수정/삭제 등)은 ADMIN만
                        .requestMatchers("/api/announcements/**", "/api/products/**").hasAuthority("ADMIN")

                        // 10. 관리자 페이지
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")

                        // 11. 내 정보 확인 등 인증된 유저 공통 기능
                        .requestMatchers("/api/users/me", "/api/auth/confirm-password").authenticated()

                        // 12. 그 외 모든 요청은 인증 필요
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
