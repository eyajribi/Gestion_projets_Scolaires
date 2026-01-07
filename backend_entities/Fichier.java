package com.Scolab.ScolabBackend.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fichier {

    @Field("nom")
    private String nom;

    @Field("url")
    private String url;

    @Field("taille")
    private Long taille; // Taille en bytes

    @Field("type")
    private String type; // ex: "pdf", "docx", "zip"

    @Field("date_upload")
    private LocalDateTime dateUpload;

    // Méthodes utilitaires
    public String getTailleFormatee() {
        if (taille == null) return "0 B";

        if (taille < 1024) {
            return taille + " B";
        } else if (taille < 1024 * 1024) {
            return String.format("%.1f KB", taille / 1024.0);
        } else {
            return String.format("%.1f MB", taille / (1024.0 * 1024.0));
        }
    }

    public boolean estImage() {
        return type != null && (type.startsWith("image/") ||
                type.equals("jpg") || type.equals("jpeg") ||
                type.equals("png") || type.equals("gif"));
    }

    public boolean estDocument() {
        return type != null && (type.equals("pdf") || type.equals("doc") ||
                type.equals("docx") || type.equals("txt"));
    }

    public boolean estArchive() {
        return type != null && (type.equals("zip") || type.equals("rar") ||
                type.equals("7z"));
    }
}
