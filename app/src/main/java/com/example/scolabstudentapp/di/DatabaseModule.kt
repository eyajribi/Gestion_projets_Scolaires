package com.example.scolabstudentapp.di

import com.example.scolabstudentapp.database.AppDatabase
import com.example.scolabstudentapp.database.dao.EtudiantDao
import com.example.scolabstudentapp.database.dao.GroupeDao
import com.example.scolabstudentapp.database.dao.ProjectDao
import com.example.scolabstudentapp.database.dao.UserDao
import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "scolab_database"
        ).fallbackToDestructiveMigration().build()
    }

    @Provides
    fun provideProjectDao(database: AppDatabase): ProjectDao {
        return database.projectDao()
    }

    @Provides
    fun provideUserDao(database: AppDatabase): UserDao {
        return database.userDao()
    }

    @Provides
    fun provideEtudiantDao(database: AppDatabase): EtudiantDao {
        return database.etudiantDao()
    }

    @Provides
    fun provideGroupeDao(database: AppDatabase): GroupeDao {
        return database.groupeDao()
    }
}
