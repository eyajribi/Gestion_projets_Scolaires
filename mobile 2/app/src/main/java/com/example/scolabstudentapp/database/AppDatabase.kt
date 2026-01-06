package com.example.scolabstudentapp.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.scolabstudentapp.database.dao.ProjectDao
import com.example.scolabstudentapp.database.dao.UserDao
import com.example.scolabstudentapp.models.Converters
import com.example.scolabstudentapp.models.Projet
import com.example.scolabstudentapp.models.User

@Database(entities = [Projet::class, User::class], version = 1, exportSchema = false)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun projectDao(): ProjectDao
    abstract fun userDao(): UserDao
}
