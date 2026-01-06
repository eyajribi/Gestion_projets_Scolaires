package com.Scolab.ScolabBackend.Config;

import com.Scolab.ScolabBackend.Service.LivrableService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class LivrableDataLoader  {
/*

    private final LivrableService livrableService;

    @Override
    public void run(String... args) throws Exception {
        String groupeId = "6959924ea2f2178b3ecfd781"; // À remplacer par l'ID réel du groupe
        String projetId = "695a935a28bb9d78cf23f1bf"; // À remplacer par l'ID réel du projet

        File file = new File("fichier_test.txt");
        if (!file.exists()) {
            System.err.println("❌ Le fichier 'fichier_test.txt' n'existe pas dans le dossier du projet !");
            return;
        }

        for (int i = 1; i <= 3; i++) {
            try (FileInputStream fis = new FileInputStream(file)) {
                // 1. Créer le livrable et récupérer son ID
                String titre = "Livrable Test " + i;
                String description = "Description de test pour le livrable " + i;
                // Méthode à adapter selon ton LivrableService
                String livrableId = livrableService.creerLivrable(titre, description, projetId, groupeId);
                // 2. Soumettre le fichier pour ce livrable
                MultipartFile fichier = new SimpleMultipartFile(file, fis);
                livrableService.soumettreLivrable(livrableId, fichier, groupeId);
                System.out.println("✅ Livrable " + i + " inséré pour le groupe " + groupeId + " et projet " + projetId);
            } catch (Exception e) {
                System.err.println("❌ Erreur lors de l'insertion du livrable " + i + ": " + e.getMessage());
            }
        }
    }

    // Classe utilitaire interne pour MultipartFile à partir d'un fichier réel
    public static class SimpleMultipartFile implements MultipartFile {
        private final File file;
        private final byte[] content;

        public SimpleMultipartFile(File file, InputStream inputStream) throws IOException {
            this.file = file;
            this.content = inputStream.readAllBytes();
        }

        @Override
        public String getName() {
            return file.getName();
        }

        @Override
        public String getOriginalFilename() {
            return file.getName();
        }

        @Override
        public String getContentType() {
            return "text/plain";
        }

        @Override
        public boolean isEmpty() {
            return content.length == 0;
        }

        @Override
        public long getSize() {
            return content.length;
        }

        @Override
        public byte[] getBytes() throws IOException {
            return content;
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new java.io.ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(File dest) throws IOException, IllegalStateException {
            java.nio.file.Files.write(dest.toPath(), content);
        }
    }

 */
}
