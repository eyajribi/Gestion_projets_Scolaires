package com.Scolab.ScolabBackend.Service;

import com.Scolab.ScolabBackend.Entity.*;
import com.Scolab.ScolabBackend.Repository.LivrableRepository;
import com.Scolab.ScolabBackend.Repository.UtilisateurRepository;
import com.Scolab.ScolabBackend.Repository.ProjetRepository;
import com.Scolab.ScolabBackend.Repository.GroupeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LivrableServiceTest {
    @Mock
    private LivrableRepository livrableRepository;
    @Mock
    private FichierStorageService fichierStorageService;
    @Mock
    private UtilisateurRepository utilisateurRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private ConverUser converUser;
    @Mock
    private ProjetRepository projetRepository;
    @Mock
    private GroupeRepository groupeRepository;

    @InjectMocks
    private LivrableService livrableService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // L'injection de converUser se fait par @Autowired, donc on ne le passe pas au constructeur
        livrableService = new LivrableService(livrableRepository, fichierStorageService, utilisateurRepository, emailService, projetRepository, groupeRepository);
    }

    @Test
    void soumettreLivrable_succes() throws IOException {
        Livrable livrable = new Livrable();
        Groupe groupe = new Groupe(); groupe.setId("g1");
        livrable.setId("l1");
        livrable.setGroupe(groupe);
        livrable.setStatut(StatutLivrable.A_SOUMETTRE);
        livrable.setDateEcheance(LocalDateTime.now().plusDays(1));
        when(livrableRepository.findById("l1")).thenReturn(Optional.of(livrable));
        MultipartFile fichier = mock(MultipartFile.class);
        Fichier fichierStocke = new Fichier(); fichierStocke.setNom("fichier.pdf");
        when(fichierStorageService.stockerFichier(fichier)).thenReturn(fichierStocke);
        when(livrableRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Livrable result = livrableService.soumettreLivrable("l1", fichier, "g1");
        assertEquals(StatutLivrable.SOUMIS, result.getStatut());
        assertEquals(fichierStocke, result.getFichier());
        assertNotNull(result.getDateSoumission());
    }

    @Test
    void evaluerLivrable_succes() {
        Livrable livrable = new Livrable();
        Groupe groupe = new Groupe(); groupe.setId("g1");
        Projet projet = new Projet();
        Enseignant enseignant = new Enseignant(); enseignant.setId("e1");
        projet.setEnseignant(enseignant);
        livrable.setId("l1");
        livrable.setGroupe(groupe);
        livrable.setProjet(projet);
        livrable.setStatut(StatutLivrable.SOUMIS);
        livrable.setFichier(new Fichier());
        livrable.setDateSoumission(LocalDateTime.now());
        when(livrableRepository.findById("l1")).thenReturn(Optional.of(livrable));
        Utilisateur utilisateur = enseignant;
        utilisateur.setRole(Role.ENSEIGNANT);
        when(utilisateurRepository.findById("e1")).thenReturn(Optional.of(utilisateur));
        when(livrableRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Livrable result = livrableService.evaluerLivrable("l1", 18.0, "Bien", "e1");
        assertEquals(StatutLivrable.CORRIGE, result.getStatut());
        assertNotNull(result.getEvaluation());
        assertEquals(18.0, result.getEvaluation().getNote());
        assertEquals("Bien", result.getEvaluation().getCommentaires());
    }

    @Test
    void mettreEnCorrection_succes() {
        Livrable livrable = new Livrable();
        Projet projet = new Projet();
        Enseignant enseignant = new Enseignant(); enseignant.setId("e1");
        projet.setEnseignant(enseignant);
        livrable.setId("l1");
        livrable.setProjet(projet);
        livrable.setStatut(StatutLivrable.SOUMIS);
        when(livrableRepository.findById("l1")).thenReturn(Optional.of(livrable));
        when(livrableRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Livrable result = livrableService.mettreEnCorrection("l1", "e1");
        assertEquals(StatutLivrable.EN_CORRECTION, result.getStatut());
    }

    @Test
    void rejeterSoumission_succes() {
        Livrable livrable = new Livrable();
        Projet projet = new Projet();
        Enseignant enseignant = new Enseignant(); enseignant.setId("e1");
        projet.setEnseignant(enseignant);
        livrable.setId("l1");
        livrable.setProjet(projet);
        livrable.setStatut(StatutLivrable.SOUMIS);
        livrable.setFichier(new Fichier());
        livrable.setDateSoumission(LocalDateTime.now());
        when(livrableRepository.findById("l1")).thenReturn(Optional.of(livrable));
        when(livrableRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        Livrable result = livrableService.rejeterSoumission("l1", "e1");
        assertEquals(StatutLivrable.REJETE, result.getStatut());
        assertNull(result.getFichier());
        assertNull(result.getDateSoumission());
    }

    @Test
    void getLivrablesByProjet_retourneListe() {
        List<Livrable> liste = Arrays.asList(new Livrable(), new Livrable());
        when(livrableRepository.findByProjetId("p1")).thenReturn(liste);
        List<Livrable> result = livrableService.getLivrablesByProjet("p1");
        assertEquals(2, result.size());
    }

    @Test
    void getLivrablesByGroupe_retourneListe() {
        List<Livrable> liste = Arrays.asList(new Livrable(), new Livrable());
        when(livrableRepository.findByGroupeId("g1")).thenReturn(liste);
        List<Livrable> result = livrableService.getLivrablesByGroupe("g1");
        assertEquals(2, result.size());
    }

    @Test
    void getLivrablesEnRetard_retourneListe() {
        List<Livrable> liste = Arrays.asList(new Livrable(), new Livrable());
        when(livrableRepository.findLivrablesEnRetard(any())).thenReturn(liste);
        List<Livrable> result = livrableService.getLivrablesEnRetard();
        assertEquals(2, result.size());
    }

    @Test
    void getLivrablesByEnseignant_retourneListe() {
        List<Livrable> liste = Arrays.asList(new Livrable(), new Livrable());
        when(livrableRepository.findByEnseignantId("e1")).thenReturn(liste);
        List<Livrable> result = livrableService.getLivrablesByEnseignant("e1");
        assertEquals(2, result.size());
    }

    @Test
    void getLivrableById_retournePresentOuVide() {
        Livrable l = new Livrable();
        when(livrableRepository.findById("l1")).thenReturn(Optional.of(l));
        Optional<Livrable> result = livrableService.getLivrableById("l1");
        assertTrue(result.isPresent());
        when(livrableRepository.findById("l2")).thenReturn(Optional.empty());
        result = livrableService.getLivrableById("l2");
        assertFalse(result.isPresent());
    }

    @Test
    void creerLivrable_succes() {
        String projetId = "p1";
        String groupeId = "g1";
        Projet projet = new Projet(); projet.setId(projetId);
        Groupe groupe = new Groupe(); groupe.setId(groupeId);
        when(projetRepository.findById(projetId)).thenReturn(Optional.of(projet));
        when(groupeRepository.findById(groupeId)).thenReturn(Optional.of(groupe));
        ArgumentCaptor<Livrable> captor = ArgumentCaptor.forClass(Livrable.class);
        Livrable saved = new Livrable(); saved.setId("l1");
        when(livrableRepository.save(any())).thenReturn(saved);
        String id = livrableService.creerLivrable("Titre Test", "Desc Test", projetId, groupeId);
        verify(livrableRepository).save(captor.capture());
        Livrable livrable = captor.getValue();
        assertEquals("Titre Test", livrable.getNom());
        assertEquals("Desc Test", livrable.getDescription());
        assertEquals(projet, livrable.getProjet());
        assertEquals(groupe, livrable.getGroupe());
        assertEquals("l1", id);
    }
}
