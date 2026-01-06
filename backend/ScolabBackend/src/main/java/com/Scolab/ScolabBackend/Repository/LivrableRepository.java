package com.Scolab.ScolabBackend.Repository;

import com.Scolab.ScolabBackend.Entity.Livrable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LivrableRepository extends MongoRepository<Livrable, String> {

    List<Livrable> findByProjetId(String projetId);

    List<Livrable> findByGroupeId(String groupeId);

    @Query("{ 'dateEcheance': { $lt: ?0 }, 'statut': { $in: ['A_SOUMETTRE', 'SOUMIS'] } }")
    List<Livrable> findLivrablesEnRetard(LocalDateTime dateActuelle);

    @Query("{ 'projet.enseignant.id': ?0 }")
    List<Livrable> findByEnseignantId(String enseignantId);
}