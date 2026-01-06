package com.Scolab.ScolabBackend.Entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "utilisateur")
@Data
@EqualsAndHashCode(callSuper = true)
public class Etudiant extends Utilisateur {

    @Field("niveau")
    private String niveau;

    @Field("filiere")
    private String filiere;
}