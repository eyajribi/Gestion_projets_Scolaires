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
class ForgotPasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _resetResult = MutableLiveData<ResetResult>()
    val resetResult: LiveData<ResetResult> = _resetResult

    fun forgotPassword(email: String) {
        viewModelScope.launch {
            _resetResult.value = ResetResult.Loading
            val result = authRepository.forgotPassword(email)
            result.onSuccess {
                _resetResult.value = ResetResult.Success(it.message ?: "Success")
            }.onFailure {
                _resetResult.value = ResetResult.Error(it.message ?: "Unknown error")
            }
        }
    }
}

sealed class ResetResult {
    data class Success(val message: String) : ResetResult()
    data class Error(val message: String) : ResetResult()
    object Loading : ResetResult()
}
