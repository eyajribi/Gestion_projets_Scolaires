package com.Scolab.ScolabBackend.Repository;

import com.Scolab.ScolabBackend.Entity.Projet;
import com.Scolab.ScolabBackend.Entity.StatutProjet;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjetRepository extends MongoRepository<Projet, String> {

    @Query("{ 'enseignant.$id': ?0 }")
    List<Projet> findByEnseignantId(String enseignantId);

    List<Projet> findByEnseignant(Utilisateur enseignant);

    @Query("{ 'groupes.id': ?0 }")
    List<Projet> findByGroupeId(String groupeId);

    @Query("{ 'enseignant.id': ?0, 'statut': ?1 }")
    List<Projet> findByEnseignantAndStatut(String enseignantId, StatutProjet statut);

    @Query("{ 'dateFin': { $lt: ?0 }, 'statut': { $ne: 'TERMINE' } }")
    List<Projet> findProjetsEnRetard(LocalDateTime dateActuelle);

    Optional<Projet> findByIdAndEnseignantId(String id, String enseignantId);

    @Query("{ 'nom': { $regex: ?0, $options: 'i' }, 'enseignant.id': ?1 }")
    List<Projet> findByNomContainingAndEnseignantId(String nom, String enseignantId);
}