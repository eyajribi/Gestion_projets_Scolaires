package com.Scolab.ScolabBackend;

import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class ScolabBackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(ScolabBackendApplication.class, args);
	}
	@Bean
	public CommandLineRunner initAdmin(UtilisateurRepository utilisateurRepository) {
		return args -> {
			if (utilisateurRepository.findByRole(Role.ADMIN).isEmpty()) {
				Utilisateur admin = new Utilisateur();
				admin.setNom("Admin");
				admin.setPrenom("Super");
				admin.setEmail("admin@scolab.com");
				admin.setPassword(new BCryptPasswordEncoder().encode("admin2026"));
				admin.setNumTel("0600000000");
				admin.setRole(Role.ADMIN);
				admin.setEstActif(true);
				admin.setEmailVerifie(true);
				admin.setDateCreation(java.time.LocalDateTime.now());
				utilisateurRepository.save(admin);
			}
		};
	}
}
