package com.Scolab.ScolabBackend.Entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "utilisateur")
@Data
@EqualsAndHashCode(callSuper = true)
public class Enseignant extends Utilisateur {

    @Field("specialite")
    private String specialite;

    @Field("projets_supervises")
    private List<Projet> projetsSupervises;
}
