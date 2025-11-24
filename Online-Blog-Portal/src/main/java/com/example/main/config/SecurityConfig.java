package com.example.main.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
public class SecurityConfig {

	@Autowired
	private JwtAuthenticationFilter jwtFilter;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http.csrf(csrf -> csrf.disable()).cors(cors -> {
		}).sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth

						// Cho phép auth API không cần token
						.requestMatchers("/api/auth/**").permitAll()

						// CHỈ cho GET post là public
						.requestMatchers("/api/posts", "/api/posts/*").permitAll()

						// CREATE / UPDATE / DELETE cần token
						.requestMatchers("/api/posts/create").authenticated().requestMatchers("/api/posts/**")
						.authenticated()

						// Cho phép static uploads
						.requestMatchers("/uploads/**").permitAll()

						// Cho phép H2 console
						.requestMatchers("/h2-console/**").permitAll()

						// Còn lại cho phép
						.anyRequest().permitAll());

		// Cho H2 console
		http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

		// Thêm JWT Filter trước Spring Auth Filter
		http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
