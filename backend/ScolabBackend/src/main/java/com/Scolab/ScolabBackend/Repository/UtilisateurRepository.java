package com.Scolab.ScolabBackend.Repository;

import com.Scolab.ScolabBackend.Entity.Enseignant;
import com.Scolab.ScolabBackend.Entity.Etudiant;
import com.Scolab.ScolabBackend.Entity.Role;
import com.Scolab.ScolabBackend.Entity.Utilisateur;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.security.AuthProvider;
import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends MongoRepository<Utilisateur, String> {
    Optional<Utilisateur> findByEmail(String email);
    Optional<Utilisateur> findByProviderId(String providerId);
    Boolean existsByEmail(String email);
    Optional<Utilisateur> findByAuthProviderAndProviderId(AuthProvider authProvider, String providerId);
    Optional<Utilisateur> findByEmailAndEstActifTrue(String email);
    Optional<Utilisateur> findByRole(Role r);
    @Query("{ 'role': 'ETUDIANT' }")
    List<Etudiant> findAllEtudiants();

    @Query("{ 'role': 'ENSEIGNANT' }")
    List<Enseignant> findAllEnseignants();

    @Query("{ '_id': ?0, 'role': 'ETUDIANT' }")
    Optional<Etudiant> findEtudiantById(String id);

    @Query("{ '_id': ?0, 'role': 'ENSEIGNANT' }")
    Optional<Enseignant> findEnseignantById(String id);

    List<Utilisateur> findByRole(String role);

    List<Utilisateur> findByEstActif(boolean estActif);

    List<Utilisateur> findByNomFac(String nomFac);

    @Query("{ 'nomDep': { $in: [?0] } }")
    List<Utilisateur> findByNomDepContaining(String nomDep);
}
