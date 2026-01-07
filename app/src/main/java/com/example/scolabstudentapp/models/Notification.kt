// models/Notification.kt
package com.example.scolabstudentapp.models

data class Notification(
    val id: String,
    val titre: String,
    val message: String,
    val date: String,
    val lu: Boolean
)