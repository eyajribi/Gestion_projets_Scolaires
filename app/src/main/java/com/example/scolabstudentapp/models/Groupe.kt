// models/Groupe.kt
package com.example.scolabstudentapp.models

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "groupes")
data class Groupe(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val nom: String,
    val description: String? = null,
    val niveau: String? = null,
    val filiere: String? = null
)