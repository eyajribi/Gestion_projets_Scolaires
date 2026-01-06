package com.Scolab.ScolabBackend.Config;

import com.Scolab.ScolabBackend.Service.CustomOAuth2UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JWTAuthFilter jwtAuthFilter;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                // désactive CSRF pour API stateless (si vous avez upload forms, ajuster)
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configure(httpSecurity))

                // IMPORTANT : pour une API, renvoyer 401 au lieu de redirection vers une page de login
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )

                .authorizeHttpRequests(request -> request
                        // endpoints publics explicites
                        .requestMatchers(
                                "/",
                                "/auth/login",
                                "/auth/register",
                                "/auth/refresh",
                                "/auth/request-password-reset",
                                "/auth/reset-password",
                                "/auth/forgot-password",
                                "/auth/change-password",
                                "/auth/oauth2/**",
                                "/oauth2/**",
                                "/login/**",
                                "/error",
                                "/api/public/**",
                                "/uploads/**",
                                "/api/fichiers/**"
                        ).permitAll()
                        // endpoints nécessitant un rôle
                        .requestMatchers("/api/etudiants/**").hasAnyAuthority("ROLE_ETUDIANT")
                        .requestMatchers("/api/enseignants/**").hasAnyAuthority("ROLE_ENSEIGNANT")
                        .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/utilisateurs/**").hasAnyAuthority("ROLE_ENSEIGNANT")
                        .requestMatchers("/api/messagerie").hasAnyAuthority("ROLE_ENSEIGNANT", "ROLE_ETUDIANT")
                        .requestMatchers("/api/projets/**").hasAnyAuthority("ROLE_ENSEIGNANT", "ROLE_ADMIN","ROLE_ETUDIANT")
                        .requestMatchers("/api/livrables/**").hasAnyAuthority("ROLE_ENSEIGNANT", "ROLE_ADMIN","ROLE_ETUDIANT")
                        .requestMatchers("/api/taches/**").hasAnyAuthority("ROLE_ENSEIGNANT", "ROLE_ADMIN","ROLE_ETUDIANT")
                        // endpoint profil utilisateur (protégé)
                        .requestMatchers("/auth/profile/**", "/auth/profile", "/auth/profile/update","/api/fichiers").authenticated()
                        // le reste nécessite authentification
                        .anyRequest().authenticated()
                )
                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2Login(oauth2 -> oauth2
                        // ne pas définir un loginPage qui provoquerait une redirection automatique
                        //.loginPage("/auth/login")
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(oAuth2SuccessHandler)
                        .failureUrl("/auth/login?error=true")
                )
                .authenticationProvider(authenticationProvider())
                // ajouter le filtre JWT avant UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return httpSecurity.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}