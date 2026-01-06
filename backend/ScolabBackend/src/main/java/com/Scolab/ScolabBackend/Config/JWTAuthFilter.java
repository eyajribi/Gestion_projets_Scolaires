package com.Scolab.ScolabBackend.Config;

import com.Scolab.ScolabBackend.Service.JWTUtils;
import com.Scolab.ScolabBackend.Service.UserDetailsService;
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JWTAuthFilter.class);

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String requestURI = request.getRequestURI();
        // Public endpoints: allow through without JWT validation
        if (requestURI.startsWith("/auth/login")
                || requestURI.startsWith("/auth/register")
                || requestURI.startsWith("/auth/refresh")
                || requestURI.startsWith("/auth/request-password-reset")
                || requestURI.startsWith("/auth/reset-password")
                || requestURI.startsWith("/oauth2/")
                || requestURI.startsWith("/auth/oauth2")
                || requestURI.equals("/error")
                || requestURI.startsWith("/api/public/")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null) {
            log.debug("No Authorization header for {}. Proceeding anonymous.", requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        if (!authHeader.startsWith("Bearer ")) {
            log.warn("Authorization header does not start with 'Bearer ' for {}: {}", requestURI, authHeader);
            filterChain.doFilter(request, response);
            return;
        }

        final String jwtToken = authHeader.substring(7);
        String userEmail = null;

        try {
            userEmail = jwtUtils.extractUsername(jwtToken);
            log.debug("JWT token present for request {}. Extracted username: {}", requestURI, userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                if (userDetails == null) {
                    log.info("UserDetails not found for username '{}' from JWT", userEmail);
                } else if (jwtUtils.isTokenValid(jwtToken, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("Authenticated user '{}' for request {}", userEmail, requestURI);
                } else {
                    log.info("JWT token invalid or expired for user '{}'", userEmail);
                }
            }
        } catch (Exception e) {
            log.warn("Error while processing JWT for request {}: {}", requestURI, e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}