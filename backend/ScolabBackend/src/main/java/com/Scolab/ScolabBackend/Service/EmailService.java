package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.Livrable;
import com.Scolab.ScolabBackend.Entity.Projet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Locale;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.email.verification-url:${app.frontend.base-url}/verify-email}")
    private String verificationUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String token, String nom, String prenom) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Vérification de votre email - EduProject");

            // Préparer le contexte pour le template Thymeleaf
            Context context = new Context(Locale.FRENCH);
            context.setVariable("nom", nom);
            context.setVariable("prenom", prenom);
            context.setVariable("verificationUrl", verificationUrl + "?token=" + token);
            context.setVariable("token", token);

            // Charger le template HTML
            String htmlContent = templateEngine.process("email-verification", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de vérification", e);
        }
    }

    public void sendPasswordResetEmail(String to, String token, String nom, String prenom) {
        try {
            String resetLink = frontendBaseUrl + "/reset-password?token=" + token;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Réinitialisation de votre mot de passe - EduProject");

            // Utiliser Thymeleaf pour le template de réinitialisation
            Context context = new Context(Locale.FRENCH);
            context.setVariable("nom", nom);
            context.setVariable("prenom", prenom);
            context.setVariable("resetLink", resetLink);
            context.setVariable("token", token);

            String htmlContent = templateEngine.process("password-reset", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de réinitialisation", e);
        }
    }

    public void sendPasswordChangedConfirmation(String to, String nom, String prenom) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Confirmation de changement de mot de passe - EduProject");

            // Utiliser Thymeleaf pour le template de confirmation
            Context context = new Context(Locale.FRENCH);
            context.setVariable("nom", nom);
            context.setVariable("prenom", prenom);

            String htmlContent = templateEngine.process("password-changed", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de confirmation", e);
        }
    }

    public void sendProjectCreatedEmail(String toEmail, String nom, String prenom, Projet projet) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Nouveau projet créé - " + projet.getNom());

            Context context = new Context(Locale.FRENCH);
            context.setVariable("nom", nom);
            context.setVariable("prenom", prenom);
            context.setVariable("projet", projet);

            String htmlContent = templateEngine.process("project-created", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de création de projet", e);
        }
    }

    public void sendProjectDeadlineEmail(String toEmail, String nom, String prenom, Projet projet) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Rappel d'échéance de projet - " + projet.getNom());

            Context context = new Context(Locale.FRENCH);
            context.setVariable("nom", nom);
            context.setVariable("prenom", prenom);
            context.setVariable("projet", projet);

            String htmlContent = templateEngine.process("project-deadline", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de rappel de projet", e);
        }
    }

    public void sendCustomNotificationEmail(String toEmail, String nom, String prenom, String titre, String messageContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(titre);

            Context context = new Context(Locale.FRENCH);
            context.setVariable("nom", nom);
            context.setVariable("prenom", prenom);
            context.setVariable("titre", titre);
            context.setVariable("message", messageContent);

            String htmlContent = templateEngine.process("custom-notification", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de notification personnalisée", e);
        }
    }

    public void sendLivrableEvaluatedEmail(String toEmail, String nom, String prenom, Livrable livrable) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Votre livrable a été évalué - " + livrable.getNom());

            Context context = new Context(Locale.FRENCH);
            context.setVariable("nom", nom);
            context.setVariable("prenom", prenom);
            context.setVariable("livrable", livrable);
            // URL vers la page de détail du livrable sur le front
            context.setVariable("livrableUrl", frontendBaseUrl + "/livrables/" + livrable.getId());

            String htmlContent = templateEngine.process("livrable-evaluated", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de livrable évalué", e);
        }
    }

    public void sendLivrableSubmittedEmail(String toEmail, String enseignantNom, String enseignantPrenom, String groupeNom, String projetNom, String livrableNom, String dateSoumission) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Nouveau dépôt de livrable - " + livrableNom);

            Context context = new Context(Locale.FRENCH);
            context.setVariable("enseignantNom", enseignantNom);
            context.setVariable("enseignantPrenom", enseignantPrenom);
            context.setVariable("groupeNom", groupeNom);
            context.setVariable("projetNom", projetNom);
            context.setVariable("livrableNom", livrableNom);
            context.setVariable("dateSoumission", dateSoumission);

            String htmlContent = templateEngine.process("livrable-submitted", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email de dépôt de livrable à l'enseignant", e);
        }
    }

    // Méthode utilitaire pour envoyer des emails simples (si nécessaire)
    private void sendEmail(String to, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);

        mailSender.send(message);
    }
}