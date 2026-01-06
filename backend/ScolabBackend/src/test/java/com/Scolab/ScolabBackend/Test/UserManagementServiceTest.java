package com.Scolab.ScolabBackend.Test;

import com.Scolab.ScolabBackend.Dto.ReqRes;
import com.Scolab.ScolabBackend.Entity.AuthProvider;
import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Service.JWTUtils;
import com.Scolab.ScolabBackend.Service.UserManagementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private UtilisateurRepository userRepository;

    @Mock
    private JWTUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private UserManagementService userManagementService;

    private Utilisateur testUser;
    private ReqRes testRegistrationRequest;
    private ReqRes testLoginRequest;
    private UserDetails testUserDetails;

    @BeforeEach
    void setUp() {
        // Configuration de l'utilisateur de test
        testUser = new Utilisateur();
        testUser.setId("1");
        testUser.setNom("Doe");
        testUser.setPrenom("John");
        testUser.setEmail("john.doe@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setRole(Role.ENSEIGNANT);
        testUser.setAuthProvider(AuthProvider.LOCAL);
        testUser.setEstActif(true);
        testUser.setEmailVerifie(false);
        testUser.setDateCreation(LocalDateTime.now());
        testUser.setDerniereConnexion(LocalDateTime.now());

        // Configuration des requêtes de test
        testRegistrationRequest = new ReqRes();
        testRegistrationRequest.setNom("Doe");
        testRegistrationRequest.setPrenom("John");
        testRegistrationRequest.setEmail("john.doe@example.com");
        testRegistrationRequest.setPassword("password123");
        testRegistrationRequest.setRole(Role.ENSEIGNANT);

        testLoginRequest = new ReqRes();
        testLoginRequest.setEmail("john.doe@example.com");
        testLoginRequest.setPassword("password123");

        // Configuration des UserDetails de test
        testUserDetails = User.builder()
                .username("john.doe@example.com")
                .password("encodedPassword")
                .authorities(Collections.emptyList())
                .build();
    }

    //Tests pour l'Inscription (Register)
    @Test
    void register_WhenEmailAlreadyExists_ShouldReturnError() {
        // Arrange - Scénario 2
        when(userRepository.existsByEmail(testRegistrationRequest.getEmail())).thenReturn(true);

        // Act
        ReqRes response = userManagementService.register(testRegistrationRequest);

        // Assert
        assertEquals("error", response.getStatus());
        assertEquals("Un utilisateur avec cet email existe déjà", response.getMessage());

        verify(userRepository).existsByEmail(testRegistrationRequest.getEmail());
        verify(userRepository, never()).save(any(Utilisateur.class));
    }

    @Test
    void register_WhenExceptionOccurs_ShouldReturnError() {
        // Arrange
        when(userRepository.existsByEmail(testRegistrationRequest.getEmail())).thenThrow(new RuntimeException("Database error"));

        // Act
        ReqRes response = userManagementService.register(testRegistrationRequest);

        // Assert
        assertEquals("error", response.getStatus());
        assertEquals(500, response.getStatusCode());
        assertTrue(response.getMessage().contains("Erreur lors de l'inscription"));
    }

    //Tests pour la Connexion (Login)
    @Test
    void login_WithInvalidPassword_ShouldReturnError() {
        // Arrange - Scénario 4
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        // Act
        ReqRes response = userManagementService.login(testLoginRequest);

        // Assert
        assertEquals("error", response.getStatus());
        assertEquals(401, response.getStatusCode());
        assertEquals("Email ou mot de passe incorrect", response.getMessage());
    }

    @Test
    void login_WithInactiveAccount_ShouldReturnError() {
        // Arrange - Scénario 5
        testUser.setEstActif(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail(testLoginRequest.getEmail())).thenReturn(Optional.of(testUser));

        // Act
        ReqRes response = userManagementService.login(testLoginRequest);

        // Assert
        assertEquals("error", response.getStatus());
        assertEquals(403, response.getStatusCode());
        assertEquals("Compte désactivé", response.getMessage());

        verify(userRepository, never()).save(any(Utilisateur.class));
    }

    @Test
    void login_WithNonExistentEmail_ShouldReturnError() {
        // Arrange - Scénario 6
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findByEmail(testLoginRequest.getEmail())).thenReturn(Optional.empty());

        // Act
        ReqRes response = userManagementService.login(testLoginRequest);

        // Assert
        assertEquals("error", response.getStatus());
        assertEquals(404, response.getStatusCode());
    }


}
