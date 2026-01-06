package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Dto.ReqRes;
import com.Scolab.ScolabBackend.Entity.AuthProvider;
import com.Scolab.ScolabBackend.Entity.Fichier;
import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class UserManagementService {
    @Autowired
    private UtilisateurRepository userRepository;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private VerificationTokenService verificationTokenService;

    @Autowired
    private FichierStorageService fichierStorageService;

    // ==================== INSCRIPTION ====================
    public ReqRes register(ReqRes registrationRequest) {
        ReqRes response = new ReqRes();

        try {
            // Vérifier si l'email existe déjà
            if (userRepository.existsByEmail(registrationRequest.getEmail())) {
                return ReqRes.error("Un utilisateur avec cet email existe déjà");
            }

            // Créer le nouvel utilisateur
            Utilisateur user = new Utilisateur();
            user.setNom(registrationRequest.getNom());
            user.setPrenom(registrationRequest.getPrenom());
            user.setEmail(registrationRequest.getEmail());
            user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
            user.setNumTel(registrationRequest.getNumTel());
            user.setNomFac(registrationRequest.getNomFac());
            user.setNomDep(registrationRequest.getNomDep());

            Role role = registrationRequest.getRole() != null ? registrationRequest.getRole() : Role.ENSEIGNANT;
            user.setRole(role);

            user.setAuthProvider(AuthProvider.LOCAL);
            user.setEstActif(true);
            user.setEmailVerifie(true);
            user.setDateCreation(LocalDateTime.now());
            user.setDerniereConnexion(LocalDateTime.now());

            // Sauvegarder l'utilisateur
            Utilisateur savedUser = userRepository.save(user);

            // Générer le token de vérification
            String verificationToken = verificationTokenService.generateVerificationToken(savedUser);

            // Envoyer l'email de vérification
            emailService.sendVerificationEmail(
                    savedUser.getEmail(),
                    verificationToken,
                    savedUser.getNom(),
                    savedUser.getPrenom()
            );

            // Préparer la réponse (sans token JWT car email non vérifié)
            response.setStatus("success");
            response.setStatusCode(200);
            response.setMessage("Utilisateur enregistré avec succès. Un email de vérification a été envoyé.");
            response.setEmail(savedUser.getEmail());
            response.setRole(savedUser.getRole());
            response.setNom(savedUser.getNom());
            response.setPrenom(savedUser.getPrenom());
            response.setUser(savedUser);
            response.setUrlPhotoProfil(savedUser.getUrlPhotoProfil());

        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors de l'inscription");
            response.setError(e.getMessage());
        }

        return response;
    }

    public Utilisateur getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<Utilisateur> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream().toList();
    }


    // ==================== CONNEXION ====================
    public ReqRes login(ReqRes loginRequest) {
        ReqRes response = new ReqRes();

        try {
            // Authentifier avec Spring Security
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Récupérer l'utilisateur
            Optional<Utilisateur> userOptional = userRepository.findByEmail(loginRequest.getEmail());
            if (userOptional.isPresent()) {
                Utilisateur user = userOptional.get();

                // Vérifier si le compte est actif
                if (!user.isEstActif()) {
                    return ReqRes.error(403, "Compte désactivé");
                }

                // Mettre à jour la dernière connexion
                user.setDerniereConnexion(LocalDateTime.now());
                userRepository.save(user);

                // Générer les tokens JWT
                UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                String jwt = jwtUtils.generateToken(userDetails);
                String refreshToken = jwtUtils.generateTokenWithClaims(new HashMap<>(), userDetails);

                // Préparer la réponse
                response.setStatus("success");
                response.setStatusCode(200);
                response.setMessage("Connexion réussie");
                response.setToken(jwt);
                response.setRefreshToken(refreshToken);
                response.setExpirationTime("24H");
                response.setEmail(user.getEmail());
                response.setRole(user.getRole());
                response.setNom(user.getNom());
                response.setPrenom(user.getPrenom());
                response.setNumTel(user.getNumTel());
                response.setNomFac(user.getNomFac());
                response.setNomDep(user.getNomDep());
                response.setDerniereConnexion(user.getDerniereConnexion());
                response.setUser(user);
                response.setUrlPhotoProfil(user.getUrlPhotoProfil());

            } else {
                return ReqRes.notFound();
            }

        } catch (BadCredentialsException e) {
            return ReqRes.error(401, "Email ou mot de passe incorrect");
        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la connexion");
            response.setError(e.getMessage());
        }

        return response;
    }

    // ==================== RAFRAÎCHIR TOKEN ====================
    public ReqRes refreshToken(ReqRes refreshRequest) {
        ReqRes response = new ReqRes();

        try {
            String email = jwtUtils.extractUsername(refreshRequest.getToken());
            Optional<Utilisateur> userOptional = userRepository.findByEmail(email);

            if (userOptional.isPresent()) {
                Utilisateur user = userOptional.get();
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                if (jwtUtils.isTokenValid(refreshRequest.getToken(), userDetails)) {
                    // Générer un nouveau token
                    String newJwt = jwtUtils.generateToken(userDetails);
                    String newRefreshToken = jwtUtils.generateTokenWithClaims(new HashMap<>(), userDetails);

                    response.setStatus("success");
                    response.setStatusCode(200);
                    response.setMessage("Token rafraîchi avec succès");
                    response.setToken(newJwt);
                    response.setRefreshToken(newRefreshToken);
                    response.setExpirationTime("24H");
                    response.setEmail(user.getEmail());
                    response.setRole(user.getRole());
                } else {
                    return ReqRes.error(401, "Token de rafraîchissement invalide");
                }
            } else {
                return ReqRes.notFound();
            }

        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors du rafraîchissement");
            response.setError(e.getMessage());
        }

        return response;
    }

    // ==================== RÉCUPÉRER TOUS LES UTILISATEURS ====================
    public ReqRes getAllUsers() {
        ReqRes response = new ReqRes();

        try {
            List<Utilisateur> users = userRepository.findAll();
            response.setStatus("success");
            response.setStatusCode(200);
            response.setMessage("Liste des utilisateurs récupérée avec succès");
            response.setUserList(users);
        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la récupération des utilisateurs");
            response.setError(e.getMessage());
        }

        return response;
    }

    // ==================== SUPPRIMER UTILISATEUR ====================
    public ReqRes deleteUser(String id) {
        ReqRes response = new ReqRes();

        try {
            Optional<Utilisateur> userOptional = userRepository.findById(id);
            if (userOptional.isPresent()) {
                Utilisateur user = userOptional.get();

                // Empêcher la suppression d'un admin
                if (user.getRole() == Role.ADMIN) {
                    return ReqRes.forbidden();
                }

                userRepository.delete(user);
                return ReqRes.success("Utilisateur supprimé avec succès");
            } else {
                return ReqRes.notFound();
            }
        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la suppression");
            response.setError(e.getMessage());
        }

        return response;
    }

    // ==================== METTRE À JOUR LE PROFIL ====================
    public ReqRes updateProfile(String email, ReqRes updateRequest) {
        ReqRes response = new ReqRes();

        try {
            Optional<Utilisateur> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                Utilisateur user = userOptional.get();

                // Mettre à jour les champs
                if (updateRequest.getNom() != null) user.setNom(updateRequest.getNom());
                if (updateRequest.getPrenom() != null) user.setPrenom(updateRequest.getPrenom());
                if (updateRequest.getNumTel() != null) user.setNumTel(updateRequest.getNumTel());
                if (updateRequest.getNomFac() != null) user.setNomFac(updateRequest.getNomFac());
                if (updateRequest.getNomDep() != null) user.setNomDep(updateRequest.getNomDep());

                Utilisateur updatedUser = userRepository.save(user);

                response.setStatus("success");
                response.setStatusCode(200);
                response.setMessage("Profil mis à jour avec succès");
                response.setEmail(updatedUser.getEmail());
                response.setRole(updatedUser.getRole());
                response.setNom(updatedUser.getNom());
                response.setPrenom(updatedUser.getPrenom());
                response.setNumTel(updatedUser.getNumTel());
                response.setNomFac(updatedUser.getNomFac());
                response.setNomDep(updatedUser.getNomDep());
                response.setUser(updatedUser);
                response.setUrlPhotoProfil(updatedUser.getUrlPhotoProfil());

            } else {
                return ReqRes.notFound();
            }
        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la mise à jour");
            response.setError(e.getMessage());
        }

        return response;
    }

    // ==================== RÉCUPÉRER INFOS UTILISATEUR ====================
    public ReqRes getMyInfo(String email) {
        ReqRes response = new ReqRes();

        try {
            Optional<Utilisateur> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                Utilisateur user = userOptional.get();

                response.setStatus("success");
                response.setStatusCode(200);
                response.setMessage("Informations récupérées avec succès");
                response.setEmail(user.getEmail());
                response.setRole(user.getRole());
                response.setNom(user.getNom());
                response.setPrenom(user.getPrenom());
                response.setNumTel(user.getNumTel());
                response.setNomFac(user.getNomFac());
                response.setNomDep(user.getNomDep());
                response.setDateCreation(user.getDateCreation());
                response.setDerniereConnexion(user.getDerniereConnexion());
                response.setUser(user);
                response.setUrlPhotoProfil(user.getUrlPhotoProfil());

            } else {
                return ReqRes.notFound();
            }
        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la récupération");
            response.setError(e.getMessage());
        }

        return response;
    }

    // ==================== CHANGER LE RÔLE ====================
    public ReqRes updateRole(String id, ReqRes roleRequest) {
        ReqRes response = new ReqRes();

        try {
            Optional<Utilisateur> userOptional = userRepository.findById(id);
            if (userOptional.isPresent()) {
                Utilisateur user = userOptional.get();

                // Empêcher de modifier le rôle d'un admin
                if (user.getRole() == Role.ADMIN) {
                    return ReqRes.forbidden();
                }

                Role newRole = Role.valueOf(roleRequest.getNewRole());
                user.setRole(newRole);
                Utilisateur updatedUser = userRepository.save(user);

                response.setStatus("success");
                response.setStatusCode(200);
                response.setMessage("Rôle mis à jour avec succès");
                response.setEmail(updatedUser.getEmail());
                response.setRole(updatedUser.getRole());
                response.setUser(updatedUser);

            } else {
                return ReqRes.notFound();
            }
        } catch (IllegalArgumentException e) {
            return ReqRes.error("Rôle invalide");
        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors du changement de rôle");
            response.setError(e.getMessage());
        }

        return response;
    }

    // ==================== ACTIVER/DÉSACTIVER COMPTE ====================
    public ReqRes toggleUserStatus(String id, boolean isActive) {
        ReqRes response = new ReqRes();

        try {
            Optional<Utilisateur> userOptional = userRepository.findById(id);
            if (userOptional.isPresent()) {
                Utilisateur user = userOptional.get();

                // Empêcher de désactiver un admin
                if (user.getRole() == Role.ADMIN && !isActive) {
                    return ReqRes.forbidden();
                }

                user.setEstActif(isActive);
                Utilisateur updatedUser = userRepository.save(user);

                response.setStatus("success");
                response.setStatusCode(200);
                response.setMessage(isActive ? "Compte activé avec succès" : "Compte désactivé avec succès");
                response.setUser(updatedUser);

            } else {
                return ReqRes.notFound();
            }
        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors du changement de statut");
            response.setError(e.getMessage());
        }

        return response;
    }
    // ==================== DEMANDE RÉINITIALISATION MOT DE PASSE ====================
    public ReqRes forgotPassword(String email) {
        try {
            System.out.println("🔍 Recherche de l'utilisateur avec email: " + email); // Debug

            Optional<Utilisateur> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                Utilisateur user = userOptional.get();
                System.out.println("✅ Utilisateur trouvé: " + user.getEmail()); // Debug

                // Vérifier si l'utilisateur est actif
                if (!user.isEstActif()) {
                    return ReqRes.error("Ce compte est désactivé");
                }

                // Générer un token de réinitialisation
                String resetToken = verificationTokenService.generatePasswordResetToken(user);
                System.out.println("🔐 Token généré: " + resetToken); // Debug

                // Envoyer l'email de réinitialisation
                emailService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getNom(), user.getPrenom());
                System.out.println("📧 Email envoyé à: " + user.getEmail()); // Debug

                return ReqRes.success("Un lien de réinitialisation a été envoyé à votre adresse email");
            } else {
                System.out.println("❌ Aucun utilisateur trouvé avec cet email: " + email); // Debug
                return ReqRes.error("Aucun compte trouvé avec cette adresse email");
            }
        } catch (Exception e) {
            System.err.println("💥 Erreur dans forgotPassword: " + e.getMessage());
            e.printStackTrace();
            return ReqRes.error(500, "Erreur lors de l'envoi de l'email de réinitialisation: " + e.getMessage());
        }
    }

    // ==================== RÉINITIALISER MOT DE PASSE ====================
    // ==================== RÉINITIALISER MOT DE PASSE ====================
    public ReqRes resetPassword(ReqRes resetRequest) {
        try {
            String token = resetRequest.getToken();
            String newPassword = resetRequest.getNewPassword();

            System.out.println("🔍 Validation du token: " + token);

            if (token == null || newPassword == null) {
                return ReqRes.error(400, "Token et nouveau mot de passe requis");
            }

            // Valider le token
            String email = verificationTokenService.validatePasswordResetToken(token);
            System.out.println("📧 Email extrait du token: " + email);

            if (email == null) {
                return ReqRes.error(400, "Token invalide ou expiré");
            }

            // Trouver l'utilisateur
            Optional<Utilisateur> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ReqRes.error(404, "Utilisateur non trouvé");
            }

            Utilisateur user = userOptional.get();
            System.out.println("✅ Utilisateur trouvé: " + user.getEmail());

            // Mettre à jour le mot de passe
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            System.out.println("🔐 Mot de passe mis à jour");

            // Invalider le token après utilisation
            verificationTokenService.invalidatePasswordResetToken(token);
            System.out.println("🗑️ Token invalidé");

            // Envoyer un email de confirmation
            emailService.sendPasswordChangedConfirmation(user.getEmail(), user.getNom(), user.getPrenom());
            System.out.println("📧 Email de confirmation envoyé");

            return ReqRes.success("Mot de passe réinitialisé avec succès");

        } catch (Exception e) {
            System.err.println("💥 Erreur dans resetPassword: " + e.getMessage());
            e.printStackTrace();
            return ReqRes.error(500, "Erreur lors de la réinitialisation: " + e.getMessage());
        }
    }

    // ==================== CHANGER MOT DE PASSE (UTILISATEUR CONNECTÉ) ====================
    public ReqRes changePassword(String email, ReqRes passwordRequest) {
        try {
            String currentPassword = passwordRequest.getCurrentPassword();
            String newPassword = passwordRequest.getNewPassword();

            if (currentPassword == null || newPassword == null) {
                return ReqRes.error(400, "Mot de passe actuel et nouveau mot de passe requis");
            }

            Optional<Utilisateur> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ReqRes.error(404, "Utilisateur non trouvé");
            }

            Utilisateur user = userOptional.get();

            // Vérifier le mot de passe actuel
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ReqRes.error(400, "Mot de passe actuel incorrect");
            }

            // Vérifier que le nouveau mot de passe est différent
            if (passwordEncoder.matches(newPassword, user.getPassword())) {
                return ReqRes.error(400, "Le nouveau mot de passe doit être différent de l'actuel");
            }

            // Mettre à jour le mot de passe
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            // Envoyer un email de confirmation
            emailService.sendPasswordChangedConfirmation(user.getEmail(), user.getNom(), user.getPrenom());

            return ReqRes.success("Mot de passe changé avec succès");

        } catch (Exception e) {
            return ReqRes.error(500, "Erreur lors du changement de mot de passe: " + e.getMessage());
        }
    }

    public ReqRes updateProfilePhoto(String email, MultipartFile photo) {
        ReqRes response = new ReqRes();
        try {
            Optional<Utilisateur> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ReqRes.notFound();
            }

            Utilisateur user = userOptional.get();

            if (photo == null || photo.isEmpty()) {
                return ReqRes.error("Aucun fichier fourni");
            }

            String contentType = photo.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ReqRes.error("Le fichier doit être une image (jpg, png, ...)");
            }

            // Stocker le fichier dans le dossier uploads (similaire aux autres fichiers)
            Fichier fichierPhoto = fichierStorageService.stockerFichier(photo);

            // Mettre à jour l'URL de la photo de profil
            user.setUrlPhotoProfil(fichierPhoto.getUrl());
            user.setDateModification(LocalDateTime.now());
            Utilisateur updatedUser = userRepository.save(user);

            response.setStatus("success");
            response.setStatusCode(200);
            response.setMessage("Photo de profil mise à jour avec succès");
            response.setEmail(updatedUser.getEmail());
            response.setRole(updatedUser.getRole());
            response.setNom(updatedUser.getNom());
            response.setPrenom(updatedUser.getPrenom());
            response.setNumTel(updatedUser.getNumTel());
            response.setNomFac(updatedUser.getNomFac());
            response.setNomDep(updatedUser.getNomDep());
            response.setUser(updatedUser);
            response.setUrlPhotoProfil(updatedUser.getUrlPhotoProfil());
            return response;
        } catch (IOException e) {
            return ReqRes.error(500, "Erreur lors du stockage de l'image: " + e.getMessage());
        } catch (Exception e) {
            response.setStatus("error");
            response.setStatusCode(500);
            response.setMessage("Erreur lors de la mise à jour de la photo de profil");
            response.setError(e.getMessage());
            return response;
        }
    }
}
