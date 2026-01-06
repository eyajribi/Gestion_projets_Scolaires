package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.AuthProvider;
import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UtilisateurRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        return processOAuth2User(userRequest, oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String provider = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = getEmail(provider, attributes);
        String name = getName(provider, attributes);
        String providerId = getProviderId(provider, attributes);

        Optional<Utilisateur> userOptional = userRepository.findByEmail(email);
        Utilisateur user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Mettre à jour les informations si nécessaire
            user.setDerniereConnexion(LocalDateTime.now());
        } else {
            // Créer un nouvel utilisateur
            user = new Utilisateur();
            String[] nomPrenom = splitFullName(name);
            String prenom = nomPrenom[0];
            String nom = nomPrenom[1];
            user.setEmail(email);
            user.setNom(nom);
            user.setPrenom(prenom);
            user.setAuthProvider(AuthProvider.valueOf(provider.toUpperCase()));
            user.setProviderId(providerId);
            user.setRole(Role.ENSEIGNANT); // Rôle par défaut
            user.setEstActif(true);
            user.setEmailVerifie(true);
            user.setDateCreation(LocalDateTime.now());
        }

        userRepository.save(user);
        return oAuth2User;
    }

    private String[] splitFullName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return new String[]{"", ""};
        }

        String[] parts = fullName.trim().split("\\s+");

        if (parts.length == 1) {
            return new String[]{parts[0], parts[0]};
        } else {
            String prenom = parts[0];
            String nom = parts[parts.length - 1];

            // Gestion des prénoms composés
            if (parts.length > 2) {
                StringBuilder prenomCompose = new StringBuilder(parts[0]);
                for (int i = 1; i < parts.length - 1; i++) {
                    prenomCompose.append(" ").append(parts[i]);
                }
                prenom = prenomCompose.toString();
            }

            return new String[]{prenom, nom};
        }
    }

    private String getEmail(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            return (String) attributes.get("email");
        } else if ("github".equals(provider)) {
            return (String) attributes.get("email");
        }
        throw new OAuth2AuthenticationException("Provider non supporté: " + provider);
    }

    private String getName(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            return (String) attributes.get("name");
        } else if ("github".equals(provider)) {
            return (String) attributes.get("name");
        }
        return "Unknown";
    }

    private String getProviderId(String provider, Map<String, Object> attributes) {
        if ("google".equals(provider)) {
            return (String) attributes.get("sub");
        } else if ("github".equals(provider)) {
            return attributes.get("id").toString();
        }
        throw new OAuth2AuthenticationException("Provider non supporté: " + provider);
    }
}
