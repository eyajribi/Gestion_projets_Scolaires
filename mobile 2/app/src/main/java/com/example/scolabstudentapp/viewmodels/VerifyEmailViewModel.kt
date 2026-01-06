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
class VerifyEmailViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _verifyResult = MutableLiveData<VerifyResult>()
    val verifyResult: LiveData<VerifyResult> = _verifyResult

    fun verifyEmail(token: String) {
        viewModelScope.launch {
            _verifyResult.value = VerifyResult.Loading
            val result = authRepository.verifyEmail(token)
            result.onSuccess {
                _verifyResult.value = VerifyResult.Success
            }.onFailure {
                _verifyResult.value = VerifyResult.Error(it.message ?: "Erreur inconnue")
            }
        }
    }

    sealed class VerifyResult {
        object Loading : VerifyResult()
        object Success : VerifyResult()
        data class Error(val message: String) : VerifyResult()
    }
}

