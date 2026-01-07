package com.example.scolabstudentapp.database.dao

import androidx.room.*
import com.example.scolabstudentapp.models.Etudiant
import kotlinx.coroutines.flow.Flow

@Dao
interface EtudiantDao {
    @Query("SELECT * FROM etudiants WHERE email = :email LIMIT 1")
    suspend fun getEtudiantByEmail(email: String): Etudiant?

    @Query("SELECT * FROM etudiants WHERE id = :id LIMIT 1")
    suspend fun getEtudiantById(id: Long): Etudiant?

    @Query("SELECT * FROM etudiants WHERE isLoggedIn = 1 LIMIT 1")
    suspend fun getCurrentEtudiant(): Etudiant?

    @Query("SELECT * FROM etudiants WHERE isLoggedIn = 1 LIMIT 1")
    fun getCurrentEtudiantFlow(): Flow<Etudiant?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEtudiant(etudiant: Etudiant): Long

    @Update
    suspend fun updateEtudiant(etudiant: Etudiant)

    @Query("UPDATE etudiants SET isLoggedIn = 0 WHERE isLoggedIn = 1")
    suspend fun logoutAll()

    @Query("UPDATE etudiants SET isLoggedIn = 1 WHERE id = :id")
    suspend fun setLoggedIn(id: Long)

    @Delete
    suspend fun deleteEtudiant(etudiant: Etudiant)

    @Query("SELECT * FROM etudiants")
    fun getAllEtudiants(): Flow<List<Etudiant>>
}
