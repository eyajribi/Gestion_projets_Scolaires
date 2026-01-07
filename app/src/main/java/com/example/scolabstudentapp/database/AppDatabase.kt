package com.example.scolabstudentapp.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.scolabstudentapp.database.dao.EtudiantDao
import com.example.scolabstudentapp.database.dao.GroupeDao
import com.example.scolabstudentapp.database.dao.ProjectDao
import com.example.scolabstudentapp.database.dao.UserDao
import com.example.scolabstudentapp.models.Converters
import com.example.scolabstudentapp.models.Etudiant
import com.example.scolabstudentapp.models.Groupe
import com.example.scolabstudentapp.models.Projet
import com.example.scolabstudentapp.models.User

@Database(
    entities = [Projet::class, User::class, Etudiant::class, Groupe::class], 
    version = 3, 
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun projectDao(): ProjectDao
    abstract fun userDao(): UserDao
    abstract fun etudiantDao(): EtudiantDao
    abstract fun groupeDao(): GroupeDao
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        
        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "scolab_database"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
