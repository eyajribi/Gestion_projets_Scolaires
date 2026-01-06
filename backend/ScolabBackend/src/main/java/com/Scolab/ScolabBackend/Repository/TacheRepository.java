package com.Scolab.ScolabBackend.Repository;

import com.Scolab.ScolabBackend.Entity.StatutTache;
import com.Scolab.ScolabBackend.Entity.Tache;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TacheRepository extends MongoRepository<Tache, String> {

    List<Tache> findByProjetId(String projetId);

    @Query("{ 'assignesA.id': ?0 }")
    List<Tache> findByEtudiantId(String etudiantId);

    @Query("{ 'dateEcheance': { $lt: ?0 }, 'statut': { $ne: 'TERMINEE' } }")
    List<Tache> findTachesEnRetard(LocalDateTime dateActuelle);

    @Query("{ 'projetId': ?0, 'statut': ?1 }")
    List<Tache> findByProjetAndStatut(String projetId, StatutTache statut);

    @Query("{ 'projet.enseignant.id': ?0 }")
    List<Tache> findByEnseignantId(String enseignantId);
}