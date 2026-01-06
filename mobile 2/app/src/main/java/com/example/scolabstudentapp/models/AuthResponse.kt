package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

data class AuthResponse(
    @SerializedName("token")
    val token: String? = null,

    @SerializedName("message")
    val message: String? = null,

    @SerializedName("statusCode")
    val statusCode: Int? = null,

    @SerializedName("user")
    val user: User? = null
)
