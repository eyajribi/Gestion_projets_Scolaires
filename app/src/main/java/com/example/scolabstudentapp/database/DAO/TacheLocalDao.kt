package com.example.scolabstudentapp.database.dao

import androidx.room.*
import com.example.scolabstudentapp.models.TacheLocal
import kotlinx.coroutines.flow.Flow

@Dao
interface TacheLocalDao {
    @Query("SELECT * FROM taches_locales WHERE etudiantEmail = :email")
    fun getTachesByEtudiant(email: String): Flow<List<TacheLocal>>

    @Query("SELECT * FROM taches_locales WHERE projetId = :projetId")
    fun getTachesByProjet(projetId: Long): Flow<List<TacheLocal>>

    @Query("SELECT * FROM taches_locales WHERE statut = 'A_FAIRE'")
    fun getTachesAFaire(): Flow<List<TacheLocal>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTache(tache: TacheLocal): Long

    @Query("SELECT * FROM taches_locales WHERE id = :id LIMIT 1")
    suspend fun getTacheById(id: Long): TacheLocal?

    @Update
    suspend fun updateTache(tache: TacheLocal)

    @Delete
    suspend fun deleteTache(tache: TacheLocal)
}
