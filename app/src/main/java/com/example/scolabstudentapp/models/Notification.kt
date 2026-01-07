// models/Notification.kt
package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

data class Notification(
    @SerializedName("id")
    val id: String = "",
    
    @SerializedName("titre")
    val titre: String = "",
    
    @SerializedName("message")
    val message: String = "",
    
    @SerializedName("dateCreation")
    val dateCreation: String = "",
    
    @SerializedName("lue")
    val lue: Boolean = false,
    
    @SerializedName("type")
    val type: String = ""
)