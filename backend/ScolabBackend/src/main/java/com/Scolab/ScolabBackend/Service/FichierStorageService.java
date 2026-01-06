package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.Fichier;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FichierStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public Fichier stockerFichier(MultipartFile file) throws IOException {
        // Créer le répertoire s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom de fichier unique
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        // Sauvegarder le fichier
        Files.copy(file.getInputStream(), filePath);

        // Créer l'objet Fichier
        Fichier fichier = new Fichier();
        fichier.setNom(file.getOriginalFilename());
        fichier.setUrl("/uploads/" + fileName);
        fichier.setTaille(file.getSize());
        fichier.setType(determinerTypeFichier(file.getOriginalFilename()));
        fichier.setDateUpload(LocalDateTime.now());

        return fichier;
    }

    public boolean supprimerFichier(String url) {
        try {
            String fileName = url.substring(url.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            return false;
        }
    }

    private String determinerTypeFichier(String fileName) {
        if (fileName == null) return "unknown";

        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        switch (extension) {
            case "pdf": return "pdf";
            case "doc": case "docx": return "document";
            case "zip": case "rar": case "7z": return "archive";
            case "jpg": case "jpeg": case "png": case "gif": return "image";
            case "txt": return "text";
            case "xls": case "xlsx": return "excel";
            default: return extension;
        }
    }
}