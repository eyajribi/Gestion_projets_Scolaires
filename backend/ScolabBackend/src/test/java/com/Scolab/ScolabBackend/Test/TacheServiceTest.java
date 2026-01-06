package com.Scolab.ScolabBackend.Test;

import com.Scolab.ScolabBackend.Entity.*;
import com.Scolab.ScolabBackend.Repository.TacheRepository;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Service.TacheService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TacheServiceTest {

    @Mock
    private TacheRepository tacheRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private TacheService tacheService;

    private Tache tache;
    private Etudiant etudiant;
    private Projet projet;

    @BeforeEach
    void setUp() {
        etudiant = new Etudiant();
        etudiant.setId("ETUDIANT_1");
        etudiant.setNom("Hadi");
        etudiant.setPrenom("Ahmed");

        projet = new Projet();
        projet.setId("PROJET_1");

        tache = new Tache();
        tache.setId("TACHE_1");
        tache.setTitre("Tâche de test");
        tache.setDescription("Description test");
        tache.setPriorite(Priorite.MOYENNE);
        tache.setStatut(StatutTache.A_FAIRE);
        tache.setDateDebut(LocalDateTime.now());
        tache.setDateEcheance(LocalDateTime.now().plusDays(7));
        tache.setProjetId("PROJET_1");
        tache.setAssignesA(new ArrayList<>());
    }

    @Test
    void getTachesByEtudiant_Success() {
        // Arrange
        List<Tache> taches = Arrays.asList(tache);
        when(tacheRepository.findByEtudiantId("ETUDIANT_1")).thenReturn(taches);

        // Act
        List<Tache> result = tacheService.getTachesByEtudiant("ETUDIANT_1");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(tacheRepository).findByEtudiantId("ETUDIANT_1");
    }

    @Test
    void getTachesEnRetard_Success() {
        // Arrange
        List<Tache> tachesEnRetard = Arrays.asList(tache);
        when(tacheRepository.findTachesEnRetard(any(LocalDateTime.class))).thenReturn(tachesEnRetard);

        // Act
        List<Tache> result = tacheService.getTachesEnRetard();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void assignerTacheAEtudiant_Success() {
        // Arrange
        when(tacheRepository.findById("TACHE_1")).thenReturn(Optional.of(tache));
        when(utilisateurRepository.findById("ETUDIANT_1")).thenReturn(Optional.of(etudiant));
        when(tacheRepository.save(any(Tache.class))).thenReturn(tache);

        // Act
        Tache result = tacheService.assignerTacheAEtudiant("TACHE_1", "ETUDIANT_1");

        // Assert
        assertNotNull(result);
        assertTrue(result.getAssignesA().contains(etudiant));
        verify(tacheRepository).save(any(Tache.class));
    }

    @Test
    void assignerTacheAEtudiant_DejaAssignee() {
        // Arrange
        tache.getAssignesA().add(etudiant);
        when(tacheRepository.findById("TACHE_1")).thenReturn(Optional.of(tache));
        when(utilisateurRepository.findById("ETUDIANT_1")).thenReturn(Optional.of(etudiant));

        // Act
        Tache result = tacheService.assignerTacheAEtudiant("TACHE_1", "ETUDIANT_1");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getAssignesA().size()); // Ne doit pas ajouter en double
    }

    @Test
    void updateTache_Success() {
        // Arrange
        Tache tacheModifiee = new Tache();
        tacheModifiee.setTitre("Titre modifié");
        tacheModifiee.setDescription("Description modifiée");
        tacheModifiee.setPriorite(Priorite.HAUTE);
        tacheModifiee.setStatut(StatutTache.EN_COURS);
        tacheModifiee.setDateDebut(LocalDateTime.now());
        tacheModifiee.setDateEcheance(LocalDateTime.now().plusDays(5));

        when(tacheRepository.findById("TACHE_1")).thenReturn(Optional.of(tache));
        when(tacheRepository.save(any(Tache.class))).thenReturn(tacheModifiee);

        // Act
        Tache result = tacheService.updateTache("TACHE_1", tacheModifiee);

        // Assert
        assertNotNull(result);
        verify(tacheRepository).save(any(Tache.class));
    }

    @Test
    void updateTache_StatutTerminee() {
        // Arrange
        Tache tacheModifiee = new Tache();
        tacheModifiee.setStatut(StatutTache.TERMINEE);

        when(tacheRepository.findById("TACHE_1")).thenReturn(Optional.of(tache));
        when(tacheRepository.save(any(Tache.class))).thenReturn(tache);

        // Act
        Tache result = tacheService.updateTache("TACHE_1", tacheModifiee);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getDateFin());
    }

    @Test
    void deleteTache_Success() {
        // Act
        tacheService.deleteTache("TACHE_1");

        // Assert
        verify(tacheRepository).deleteById("TACHE_1");
    }

    @Test
    void getTacheById_Success() {
        // Arrange
        when(tacheRepository.findById("TACHE_1")).thenReturn(Optional.of(tache));

        // Act
        Optional<Tache> result = tacheService.getTacheById("TACHE_1");

        // Assert
        assertTrue(result.isPresent());
        assertEquals(tache.getId(), result.get().getId());
    }

    @Test
    void getTachesByProjet_Success() {
        // Arrange
        List<Tache> taches = Arrays.asList(tache);
        when(tacheRepository.findByProjetId("PROJET_1")).thenReturn(taches);

        // Act
        List<Tache> result = tacheService.getTachesByProjet("PROJET_1");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getTachesByProjetAndStatut_Success() {
        // Arrange
        List<Tache> taches = Arrays.asList(tache);
        when(tacheRepository.findByProjetAndStatut("PROJET_1", StatutTache.A_FAIRE))
                .thenReturn(taches);

        // Act
        List<Tache> result = tacheService.getTachesByProjetAndStatut("PROJET_1", StatutTache.A_FAIRE);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void changerStatutTache_Success() {
        // Arrange
        when(tacheRepository.findById("TACHE_1")).thenReturn(Optional.of(tache));
        when(tacheRepository.save(any(Tache.class))).thenReturn(tache);

        // Act
        Tache result = tacheService.changerStatutTache("TACHE_1", StatutTache.EN_COURS);

        // Assert
        assertNotNull(result);
        verify(tacheRepository).save(any(Tache.class));
    }

    @Test
    void creerTache_Success() {
        // Arrange
        when(tacheRepository.save(any(Tache.class))).thenReturn(tache);

        // Act
        Tache result = tacheService.creerTache(tache);

        // Assert
        assertNotNull(result);
        assertEquals(StatutTache.A_FAIRE, result.getStatut());
        assertNotNull(result.getDateDebut());
        verify(tacheRepository).save(any(Tache.class));
    }

    @Test
    void retirerEtudiantDeTache_Success() {
        // Arrange
        tache.getAssignesA().add(etudiant);
        when(tacheRepository.findById("TACHE_1")).thenReturn(Optional.of(tache));
        when(tacheRepository.save(any(Tache.class))).thenReturn(tache);

        // Act
        Tache result = tacheService.retirerEtudiantDeTache("TACHE_1", "ETUDIANT_1");

        // Assert
        assertNotNull(result);
        assertFalse(result.getAssignesA().contains(etudiant));
        verify(tacheRepository).save(any(Tache.class));
    }
}
