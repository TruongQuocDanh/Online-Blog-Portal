package com.example.main.config;

import com.example.main.service.impl.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private CustomUserDetailsService userDetailsService;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		final String authHeader = request.getHeader("Authorization");

		// LOG 1 — print raw header
		System.out.println("=== JWT FILTER START ===");
		System.out.println("REQUEST: " + request.getMethod() + " " + request.getRequestURI());
		System.out.println("Authorization Header = " + authHeader);

		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			System.out.println("NO VALID TOKEN → SKIP");
			System.out.println("=== JWT FILTER END ===");
			filterChain.doFilter(request, response);
			return;
		}

		String jwt = authHeader.substring(7);

		// LOG 2 — show token
		System.out.println("JWT Token = " + jwt);

		String email = jwtUtil.extractEmail(jwt);

		// LOG 3 — decoded email
		System.out.println("Decoded Email = " + email);

		if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

			UserDetails userDetails = userDetailsService.loadUserByUsername(email);

			if (jwtUtil.isTokenValid(jwt, userDetails.getUsername())) {

				// LOG 4 — token validation passed
				System.out.println("JWT VALID. Setting authentication…");

				UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails,
						null, userDetails.getAuthorities());

				authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

				SecurityContextHolder.getContext().setAuthentication(authToken);

			} else {
				System.out.println("JWT INVALID FOR USER: " + userDetails.getUsername());
			}
		} else {
			System.out.println("EMAIL NULL OR ALREADY AUTHENTICATED.");
		}

		System.out.println("AUTH PRINCIPAL AFTER FILTER: " + SecurityContextHolder.getContext().getAuthentication());

		System.out.println("=== JWT FILTER END ===");

		filterChain.doFilter(request, response);
	}
}
