package com.Scolab.ScolabBackend.Config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Générer les hashs pour tous les utilisateurs
        String[] passwords = {"riadh123", "leila123", "hichem123", "mohamed123", "fatma123", "ahmed123", "amina123", "khalil123", "salma123"};

        for (String password : passwords) {
            String encodedPassword = encoder.encode(password);
            System.out.println("Mot de passe: " + password + " -> Hash: " + encodedPassword);
        }
    }
}