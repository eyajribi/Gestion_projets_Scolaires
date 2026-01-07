package com.example.scolabstudentapp.models

import com.google.gson.annotations.SerializedName

data class ReqRes(
    @SerializedName("status")
    val status: String? = null,
    
    @SerializedName("message")
    val message: String? = null,
    
    @SerializedName("data")
    val data: Any? = null,
    
    @SerializedName("token")
    val token: String? = null,
    
    @SerializedName("statusCode")
    val statusCode: Int? = null
)

