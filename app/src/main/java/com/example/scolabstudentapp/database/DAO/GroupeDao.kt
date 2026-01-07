package com.example.scolabstudentapp.database.dao

import androidx.room.*
import com.example.scolabstudentapp.models.Groupe
import kotlinx.coroutines.flow.Flow

@Dao
interface GroupeDao {
    @Query("SELECT * FROM groupes")
    fun getAllGroupes(): Flow<List<Groupe>>

    @Query("SELECT * FROM groupes WHERE id = :id LIMIT 1")
    suspend fun getGroupeById(id: Long): Groupe?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGroupe(groupe: Groupe): Long

    @Update
    suspend fun updateGroupe(groupe: Groupe)

    @Delete
    suspend fun deleteGroupe(groupe: Groupe)
}
