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
    
    @SerializedName("refreshToken")
    val refreshToken: String? = null,
    
    @SerializedName("statusCode")
    val statusCode: Int? = null,
    
    @SerializedName("email")
    val email: String? = null,
    
    @SerializedName("password")
    val password: String? = null,
    
    @SerializedName("nom")
    val nom: String? = null,
    
    @SerializedName("prenom")
    val prenom: String? = null,
    
    @SerializedName("numTel")
    val numTel: String? = null,
    
    @SerializedName("nomFac")
    val nomFac: String? = null,
    
    @SerializedName("nomDep")
    val nomDep: List<String>? = null,
    
    @SerializedName("role")
    val role: String? = null,
    
    @SerializedName("estActif")
    val estActif: Boolean? = null,
    
    @SerializedName("emailVerifie")
    val emailVerifie: Boolean? = null,
    
    @SerializedName("user")
    val user: User? = null
) {
    companion object {
        fun error(statusCode: Int, message: String): ReqRes {
            return ReqRes(
                status = "error",
                message = message,
                statusCode = statusCode
            )
        }
        
        fun success(message: String): ReqRes {
            return ReqRes(
                status = "success",
                message = message,
                statusCode = 200
            )
        }
        
        fun success(message: String, token: String): ReqRes {
            return ReqRes(
                status = "success",
                message = message,
                token = token,
                statusCode = 200
            )
        }
    }
    
    fun getStatusCode(): Int {
        return statusCode ?: if (status == "success") 200 else 400
    }
}

