package com.Scolab.ScolabBackend.Entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "verification_tokens")
@Data
public class VerificationToken {

    @Id
    private String id;

    @Field("token")
    private String token;

    @DBRef
    @Field("user")
    private Utilisateur user;

    @Field("expiry_date")
    private LocalDateTime expiryDate;

    @Field("token_type")
    private TokenType tokenType; // Ajoutez ce champ

    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}