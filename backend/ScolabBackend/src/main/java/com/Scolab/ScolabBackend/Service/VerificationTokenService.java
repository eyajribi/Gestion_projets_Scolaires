package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Dto.ReqRes;
import com.Scolab.ScolabBackend.Entity.TokenType;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Entity.VerificationToken;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class VerificationTokenService {

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private UtilisateurRepository userRepository;

    // 24 heures d'expiration
    private static final int EXPIRATION_HOURS = 24;

    public String generateVerificationToken(Utilisateur user) {
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(EXPIRATION_HOURS));
        verificationTokenRepository.save(verificationToken);
        return token;
    }

    public ReqRes verifyEmail(String token) {
        ReqRes response = new ReqRes();

        try {
            VerificationToken verificationToken = verificationTokenRepository.findByToken(token);

            if (verificationToken == null) {
                return ReqRes.error("Token de vérification invalide");
            }

            if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                verificationTokenRepository.delete(verificationToken);
                return ReqRes.error("Le token de vérification a expiré");
            }

            Utilisateur user = verificationToken.getUser();
            user.setEmailVerifie(true);
            userRepository.save(user);

            // Supprimer le token utilisé
            verificationTokenRepository.delete(verificationToken);

            response.setStatus("success");
            response.setStatusCode(200);
            response.setMessage("Email vérifié avec succès");
            response.setEmail(user.getEmail());
            response.setUser(user);

        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la vérification de l'email");
            response.setError(e.getMessage());
        }

        return response;
    }

    public String resendVerificationToken(String email) {
        Utilisateur user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Supprimer les anciens tokens
        verificationTokenRepository.deleteByUser(user);

        // Générer un nouveau token
        return generateVerificationToken(user);
    }

    public String generatePasswordResetToken(Utilisateur user) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = calculateExpiryDate(60); // 60 minutes

        // Supprimer les anciens tokens de réinitialisation pour cet utilisateur
        verificationTokenRepository.deleteByUserAndTokenType(user, TokenType.PASSWORD_RESET);

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setTokenType(TokenType.PASSWORD_RESET);
        verificationToken.setExpiryDate(expiryDate);
        verificationToken.setCreatedAt(LocalDateTime.now());

        verificationTokenRepository.save(verificationToken);
        return token;
    }

    private LocalDateTime calculateExpiryDate(int expiryTimeInMinutes) {
        return LocalDateTime.now().plusMinutes(expiryTimeInMinutes);
    }

    public String validatePasswordResetToken(String token) {
        Optional<VerificationToken> verificationToken = verificationTokenRepository.findByTokenAndTokenType(token, TokenType.PASSWORD_RESET);

        if (verificationToken.isEmpty()) {
            return null;
        }

        VerificationToken resetToken = verificationToken.get();

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(resetToken);
            return null;
        }

        return resetToken.getUser().getEmail();
    }

    public void invalidatePasswordResetToken(String token) {
        verificationTokenRepository.findByTokenAndTokenType(token, TokenType.PASSWORD_RESET)
                .ifPresent(verificationTokenRepository::delete);
    }
}
