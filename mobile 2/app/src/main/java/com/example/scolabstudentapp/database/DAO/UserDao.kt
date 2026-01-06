package com.example.scolabstudentapp.database.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.scolabstudentapp.models.User
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: User)

    @Update
    suspend fun updateUser(user: User)

    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getUserById(userId: String): User?

    @Query("SELECT * FROM users WHERE email = :email")
    suspend fun getUserByEmail(email: String): User?

    @Query("SELECT * FROM users WHERE isLoggedIn = 1 LIMIT 1")
    suspend fun getCurrentUser(): User?

    @Query("SELECT * FROM users")
    fun getAllUsers(): Flow<List<User>>

    @Query("UPDATE users SET isLoggedIn = 0")
    suspend fun logoutAllUsers()

    @Query("UPDATE users SET isLoggedIn = 1 WHERE id = :userId")
    suspend fun setUserLoggedIn(userId: String)

    @Query("DELETE FROM users WHERE id = :userId")
    suspend fun deleteUser(userId: String)

    @Query("DELETE FROM users")
    suspend fun deleteAllUsers()
}
