package com.example.scolabstudentapp.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.example.scolabstudentapp.models.Projet
import com.example.scolabstudentapp.repositories.ProjectRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProjectsViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    val projects: LiveData<List<Projet>> = projectRepository.allProjects.asLiveData()

    private val _refreshState = MutableLiveData<RefreshState>()
    val refreshState: LiveData<RefreshState> = _refreshState

    init {
        refreshProjects()
    }

    fun refreshProjects() {
        viewModelScope.launch {
            _refreshState.value = RefreshState.Loading
            val result = projectRepository.refreshProjects()
            result.onSuccess {
                _refreshState.value = RefreshState.Success
            }.onFailure {
                _refreshState.value = RefreshState.Error(it.message ?: "An unknown error occurred")
            }
        }
    }
}

sealed class RefreshState {
    object Success : RefreshState()
    data class Error(val message: String) : RefreshState()
    object Loading : RefreshState()
}
