package com.example.scolabstudentapp.database.dao

import androidx.room.*
import com.example.scolabstudentapp.models.ProjetLocal
import kotlinx.coroutines.flow.Flow

@Dao
interface ProjetLocalDao {
    @Query("SELECT * FROM projets_locaux WHERE etudiantEmail = :email")
    fun getProjetsByEtudiant(email: String): Flow<List<ProjetLocal>>

    @Query("SELECT * FROM projets_locaux WHERE groupeId = :groupeId")
    fun getProjetsByGroupe(groupeId: Long): Flow<List<ProjetLocal>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProjet(projet: ProjetLocal): Long

    @Query("SELECT * FROM projets_locaux WHERE id = :id LIMIT 1")
    suspend fun getProjetById(id: Long): ProjetLocal?

    @Update
    suspend fun updateProjet(projet: ProjetLocal)

    @Delete
    suspend fun deleteProjet(projet: ProjetLocal)
}
