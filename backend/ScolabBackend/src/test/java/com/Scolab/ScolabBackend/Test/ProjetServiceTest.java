package com.Scolab.ScolabBackend.Test;

import com.Scolab.ScolabBackend.Entity.*;
import com.Scolab.ScolabBackend.Repository.GroupeRepository;
import com.Scolab.ScolabBackend.Repository.ProjetRepository;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Service.ProjetService;
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
class ProjetServiceTest {

    @Mock
    private ProjetRepository projetRepository;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private GroupeRepository groupeRepository;

    @InjectMocks
    private ProjetService projetService;

    private Enseignant enseignant;
    private Projet projet;
    private Groupe groupe;
    private Tache tache;

    @BeforeEach
    void setUp() {
        enseignant = new Enseignant();
        enseignant.setId("ENSEIGNANT_1");
        enseignant.setEmail("prof@gmail.com");
        enseignant.setNom("Donia");
        enseignant.setPrenom("Hichri");

        projet = new Projet();
        projet.setId("PROJET_1");
        projet.setNom("Projet Test");
        projet.setDescription("Description test");
        projet.setEnseignant(enseignant);
        projet.setDateCreation(LocalDateTime.now());
        projet.setStatut(StatutProjet.PLANIFIE);

        groupe = new Groupe();
        groupe.setId("GROUPE_1");
        groupe.setNom("Groupe A");

        tache = new Tache();
        tache.setId("TACHE_1");
        tache.setTitre("Tâche test");
    }

    @Test
    void getProjetsByEnseignant_Success() {
        // Arrange
        String email = "prof@gmail.com";
        List<Projet> projets = Arrays.asList(projet);

        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.of(enseignant));
        when(projetRepository.findAll()).thenReturn(projets);

        // Act
        List<Projet> result = projetService.getProjetsByEnseignant(email);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(projet.getId(), result.get(0).getId());
        verify(utilisateurRepository).findByEmail(email);
        verify(projetRepository).findAll();
    }

    @Test
    void getProjetsByEnseignant_EnseignantNotFound() {
        // Arrange
        String email = "unknown@univ.fr";
        when(utilisateurRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act
        List<Projet> result = projetService.getProjetsByEnseignant(email);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getProjetById_Success() {
        // Arrange
        when(projetRepository.findById("PROJET_1")).thenReturn(Optional.of(projet));

        // Act
        Optional<Projet> result = projetService.getProjetById("PROJET_1");

        // Assert
        assertTrue(result.isPresent());
        assertEquals(projet.getId(), result.get().getId());
    }

    @Test
    void getProjetById_NotFound() {
        // Arrange
        when(projetRepository.findById("UNKNOWN")).thenReturn(Optional.empty());

        // Act
        Optional<Projet> result = projetService.getProjetById("UNKNOWN");

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    void creerProjet_Success() {
        // Arrange
        Projet nouveauProjet = new Projet();
        nouveauProjet.setNom("Nouveau Projet");
        nouveauProjet.setDescription("Description");

        when(utilisateurRepository.findById("ENSEIGNANT_1")).thenReturn(Optional.of(enseignant));
        when(projetRepository.save(any(Projet.class))).thenReturn(projet);

        // Act
        Projet result = projetService.creerProjet(nouveauProjet, "ENSEIGNANT_1");

        // Assert
        assertNotNull(result);
        assertEquals(enseignant, result.getEnseignant());
        assertEquals(StatutProjet.PLANIFIE, result.getStatut());
        assertEquals(0.0, result.getPourcentageAvancement());
        verify(projetRepository).save(any(Projet.class));
    }

    @Test
    void creerProjet_EnseignantNotFound() {
        // Arrange
        when(utilisateurRepository.findById("UNKNOWN")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
                projetService.creerProjet(projet, "UNKNOWN"));
    }

    @Test
    void modifierProjet_Success() {
        // Arrange
        Projet projetModifie = new Projet();
        projetModifie.setNom("Projet Modifié");
        projetModifie.setDescription("Nouvelle description");
        projetModifie.setDateDebut(LocalDateTime.now());
        projetModifie.setDateFin(LocalDateTime.now().plusDays(30));

        when(projetRepository.findById("PROJET_1")).thenReturn(Optional.of(projet));
        when(projetRepository.save(any(Projet.class))).thenReturn(projetModifie);

        // Act
        Projet result = projetService.modifierProjet("PROJET_1", projetModifie);

        // Assert
        assertNotNull(result);
        verify(projetRepository).save(any(Projet.class));
    }

    @Test
    void modifierProjet_NotFound() {
        // Arrange
        when(projetRepository.findById("UNKNOWN")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
                projetService.modifierProjet("UNKNOWN", projet));
    }

    @Test
    void supprimerProjet_Success() {
        // Act
        projetService.supprimerProjet("PROJET_1");

        // Assert
        verify(projetRepository).deleteById("PROJET_1");
    }

    @Test
    void ajouterTacheAuProjet_Success() {
        // Arrange
        when(projetRepository.findById("PROJET_1")).thenReturn(Optional.of(projet));
        when(projetRepository.save(any(Projet.class))).thenReturn(projet);

        // Act
        Tache result = projetService.ajouterTacheAuProjet("PROJET_1", tache);

        // Assert
        assertNotNull(result);
        assertEquals("PROJET_1", tache.getProjetId());
        verify(projetRepository).save(any(Projet.class));
    }

    @Test
    void getProjetsEnRetard_Success() {
        // Arrange
        List<Projet> projetsEnRetard = Arrays.asList(projet);
        when(projetRepository.findProjetsEnRetard(any(LocalDateTime.class))).thenReturn(projetsEnRetard);

        // Act
        List<Projet> result = projetService.getProjetsEnRetard();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void changerStatutProjet_Success() {
        // Arrange
        when(projetRepository.findById("PROJET_1")).thenReturn(Optional.of(projet));
        when(projetRepository.save(any(Projet.class))).thenReturn(projet);

        // Act
        Projet result = projetService.changerStatutProjet("PROJET_1", StatutProjet.EN_COURS);

        // Assert
        assertNotNull(result);
        verify(projetRepository).save(any(Projet.class));
    }

    @Test
    void assignerGroupeAuProjet_Success() {
        // Arrange
        when(projetRepository.findById("PROJET_1")).thenReturn(Optional.of(projet));
        when(groupeRepository.findById("GROUPE_1")).thenReturn(Optional.of(groupe));
        when(projetRepository.save(any(Projet.class))).thenReturn(projet);

        // Act
        Projet result = projetService.assignerGroupeAuProjet("PROJET_1", "GROUPE_1");

        // Assert
        assertNotNull(result);
        verify(projetRepository).save(any(Projet.class));
    }

    @Test
    void getTachesDuProjet_Success() {
        // Arrange
        projet.getTaches().add(tache);
        when(projetRepository.findById("PROJET_1")).thenReturn(Optional.of(projet));

        // Act
        List<Tache> result = projetService.getTachesDuProjet("PROJET_1");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
    }
}
