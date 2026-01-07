package com.example.scolabstudentapp.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.scolabstudentapp.models.User
import com.example.scolabstudentapp.repositories.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val profileRepository: ProfileRepository
) : ViewModel() {

    private val _profileResult: MutableLiveData<ProfileResultState> = MutableLiveData(ProfileResultState.Loading)
    val profileResult: LiveData<ProfileResultState> = _profileResult

    fun loadUserProfile() {
        viewModelScope.launch {
            _profileResult.value = ProfileResultState.Loading
            val result = profileRepository.getUserProfile()

            result.onSuccess {
                if (it.user != null) {
                    _profileResult.value = ProfileResultState.Success(it.user)
                } else {
                    _profileResult.value = ProfileResultState.Error("User data is null")
                }
            }.onFailure {
                _profileResult.value =
                    ProfileResultState.Error(it.message ?: "An unknown error occurred")
            }
        }
    }

    fun saveProfile(
        nom: String,
        prenom: String,
        numTel: String,
        fac: String,
        dep: String,
        niveau: String,
        filiere: String
    ) {
        viewModelScope.launch {
            _profileResult.value = ProfileResultState.Loading
            val result = profileRepository.updateUserProfile(
                nom, prenom, numTel, fac, dep, niveau, filiere
            )
            result.onSuccess {
                _profileResult.value = ProfileResultState.Success(it)
            }.onFailure {
                _profileResult.value = ProfileResultState.Error(it.message ?: "Erreur lors de la sauvegarde du profil")
            }
        }
    }
}

sealed class ProfileResultState {
    data class Success(val user: User) : ProfileResultState()
    data class Error(val message: String) : ProfileResultState()
    object Loading : ProfileResultState()
}
