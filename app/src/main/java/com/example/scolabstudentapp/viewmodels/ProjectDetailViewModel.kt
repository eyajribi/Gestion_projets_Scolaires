package com.example.scolabstudentapp.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.scolabstudentapp.models.Projet
import com.example.scolabstudentapp.repositories.ProjectRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProjectDetailViewModel @Inject constructor(
    private val projectRepository: ProjectRepository
) : ViewModel() {

    private val _project = MutableLiveData<Projet?>()
    val project: LiveData<Projet?> = _project

    fun loadProject(projectId: String) {
        viewModelScope.launch {
            val result = projectRepository.getProjectById(projectId)
            _project.postValue(result)
        }
    }
}
