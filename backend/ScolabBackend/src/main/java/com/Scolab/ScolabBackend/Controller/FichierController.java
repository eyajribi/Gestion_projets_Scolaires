package com.Scolab.ScolabBackend.Controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.net.MalformedURLException;

@RestController
@RequestMapping("/api/fichiers")
public class FichierController {

    // Chemin de stockage des fichiers (adapter si besoin)
    private final String storagePath = "uploads/";

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            File file = new File(storagePath + filename);
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }
            Resource resource = new UrlResource(file.toURI());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

