package com.Scolab.ScolabBackend.Config;

import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Service.JWTUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private UtilisateurRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");

        Optional<Utilisateur> userOptional = userRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            Utilisateur user = userOptional.get();
            String jwtToken = jwtUtils.generateToken(
                    org.springframework.security.core.userdetails.User
                            .withUsername(user.getEmail())
                            .password("")
                            .authorities("ROLE_" + user.getRole().name())
                            .build()
            );

            String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/success")
                    .queryParam("token", jwtToken)
                    .queryParam("email", user.getEmail())
                    .queryParam("role", user.getRole().name())
                    .build().toUriString();

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            super.onAuthenticationSuccess(request, response, authentication);
        }
    }
}
