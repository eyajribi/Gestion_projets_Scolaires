package com.example.scolabstudentapp.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.scolabstudentapp.repositories.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _registerResult = MutableLiveData<RegisterResult>()
    val registerResult: LiveData<RegisterResult> = _registerResult

    fun register(
        nom: String,
        prenom: String,
        email: String,
        password: String,
        numTel: String?,
        nomFac: String?,
        nomDep: String?,
        niveau: String?,
        filiere: String?
    ) {
        viewModelScope.launch {
            _registerResult.value = RegisterResult.Loading
            val result = authRepository.register(nom, prenom, email, password, numTel, nomFac, nomDep, niveau, filiere)

            result.onSuccess {
                _registerResult.value = RegisterResult.Success
            }.onFailure {
                _registerResult.value = RegisterResult.Error(it.message ?: "An unknown error occurred")
            }
        }
    }
}

sealed class RegisterResult {
    object Success : RegisterResult()
    data class Error(val message: String) : RegisterResult()
    object Loading : RegisterResult()
}
