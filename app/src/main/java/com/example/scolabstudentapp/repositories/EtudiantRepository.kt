package com.example.scolabstudentapp.repositories

import com.example.scolabstudentapp.database.dao.EtudiantDao
import com.example.scolabstudentapp.database.dao.GroupeDao
import com.example.scolabstudentapp.models.Etudiant
import com.example.scolabstudentapp.models.Groupe
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EtudiantRepository @Inject constructor(
    private val etudiantDao: EtudiantDao,
    private val groupeDao: GroupeDao
) {

    suspend fun createDefaultEtudiant(): Etudiant {
        // Créer un groupe par défaut
        val groupeId = groupeDao.insertGroupe(
            Groupe(
                nom = "Groupe A",
                description = "Groupe d'étudiants par défaut",
                niveau = "L3",
                filiere = "Informatique"
            )
        )

        // Créer l'étudiant par défaut
        val etudiant = Etudiant(
            email = "demo@scolab.com",
            nom = "Demo",
            prenom = "User",
            numTel = "0612345678",
            nomFac = "Faculté des Sciences",
            nomDep = listOf("Informatique"),
            niveau = "L3",
            filiere = "Informatique",
            groupeId = groupeId,
            estActif = true,
            emailVerifie = true,
            isLoggedIn = true
        )
        
        val etudiantId = etudiantDao.insertEtudiant(etudiant)
        return etudiant.copy(id = etudiantId)
    }

    suspend fun getCurrentEtudiant(): Etudiant? {
        return etudiantDao.getCurrentEtudiant()
    }

    fun getCurrentEtudiantFlow(): Flow<Etudiant?> {
        return etudiantDao.getCurrentEtudiantFlow()
    }

    suspend fun updateEtudiant(etudiant: Etudiant) {
        etudiantDao.updateEtudiant(etudiant)
    }

    suspend fun getEtudiantByEmail(email: String): Etudiant? {
        return etudiantDao.getEtudiantByEmail(email)
    }

    suspend fun loginEtudiant(email: String): Etudiant {
        var etudiant = etudiantDao.getEtudiantByEmail(email)
        
        if (etudiant == null) {
            etudiant = createEtudiantWithProjectsAndTasks(email)
        } else {
            // Mettre à jour le statut de connexion
            etudiantDao.logoutAll()
            etudiantDao.setLoggedIn(etudiant.id)
            etudiant = etudiant.copy(isLoggedIn = true)
        }
        
        return etudiant
    }
    
    private suspend fun createEtudiantWithProjectsAndTasks(email: String): Etudiant {
        // Créer un groupe par défaut
        val groupeId = groupeDao.insertGroupe(
            Groupe(
                nom = "Groupe A - Informatique",
                description = "Groupe d'étudiants en Informatique L3",
                niveau = "L3",
                filiere = "Informatique"
            )
        )

        // Créer l'étudiant avec les informations spécifiques
        val etudiant = Etudiant(
            email = email,
            nom = if (email == "eyajribi8@gmail.com") "RIBI" else "Demo",
            prenom = if (email == "eyajribi8@gmail.com") "Youssef" else "User",
            numTel = "0612345678",
            nomFac = "Faculté des Sciences",
            nomDep = listOf("Informatique"),
            niveau = "L3",
            filiere = "Informatique",
            groupeId = groupeId,
            estActif = true,
            emailVerifie = true,
            isLoggedIn = true
        )
        
        val etudiantId = etudiantDao.insertEtudiant(etudiant)
        return etudiant.copy(id = etudiantId)
    }

    suspend fun logoutEtudiant() {
        etudiantDao.logoutAll()
    }

    fun getAllGroupes(): Flow<List<Groupe>> {
        return groupeDao.getAllGroupes()
    }

    suspend fun getGroupeById(id: Long): Groupe? {
        return groupeDao.getGroupeById(id)
    }
}
