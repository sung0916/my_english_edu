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
                        .requestMatchers(HttpMethod.OPTIONS, "**").permitAll()  // 관리자페이지 승인대기목록 노출용
                        .requestMatchers("/api/auth/login", "/api/users/signup", "/api/announcements/list", "/api/products/list").permitAll()  // 로그인, 회원가입 허용
                        .requestMatchers("/api/admin/**", "/api/announcements/**", "/api/products/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/users/me").hasAnyAuthority("ADMIN", "TEACHER", "STUDENT")
                        .requestMatchers("/api/auth/confirm-password").hasAnyAuthority("ADMIN", "TEACHER", "STUDENT")
                        .anyRequest().authenticated()  // 그 외의 요청은 인증 필요
                )
                // JwtAuthenticationFilter를 UsernamePasswordAuthenticationFilter 앞에 추가
                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil, userDetailsService),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS 설정을 위한 Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 출처(Origin) 설정
        configuration.setAllowedOrigins(List.of("http://localhost:8081", "http://localhost:19006"));

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
