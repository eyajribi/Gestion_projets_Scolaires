package com.example.scolabstudentapp.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.scolabstudentapp.models.Projet
import kotlinx.coroutines.flow.Flow

@Dao
interface ProjectDao {

    @Query("SELECT * FROM projects WHERE estArchive = 0 ORDER BY dateDebut DESC")
    fun getAllProjects(): Flow<List<Projet>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(projects: List<Projet>)

    @Query("DELETE FROM projects")
    suspend fun deleteAll()
}
